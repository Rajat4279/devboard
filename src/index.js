import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger/index.js';
import authRoutes from './routes/auth.route.js';
import projectRoutes from './routes/project.route.js';
import taskRoutes from './routes/task.route.js';
import collaboratorRoutes from './routes/collaborator.route.js';
import { connectRedis } from './lib/redis.connect.js';

dotenv.config({
    path: '.env',
});

const PORT = process.env.PORT || 8000;
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: '*',
        credentials: true,
    })
);

(async () => {
    try {
        const rateLimiter = await connectRedis();
        logger.info('Redis connected successfully');

        app.get('/', (req, res) => {
            res.status(200).json({ message: 'Welcome to the API' });
        });

        app.use('/api/v1', authRoutes);

        app.use(async (req, res, next) => {
            try {
                const identifier = req.ip;
                logger.info(`Rate limiting for IP: ${identifier}`);

                try {
                    const count = await rateLimiter.get(identifier);
                    logger.info(
                        `Current count for ${identifier}: ${count || 'null'}`
                    );

                    if (count) {
                        if (parseInt(count, 10) >= 10) {
                            logger.info(
                                `Rate limit exceeded for ${identifier}`
                            );
                            return res.status(429).json({
                                message:
                                    'Too many requests. Try again in a minute.',
                            });
                        }

                        const newCount = await rateLimiter.incr(identifier);
                        logger.info(
                            `Incremented count for ${identifier} to ${newCount}`
                        );
                    } else {
                        await rateLimiter.set(identifier, 1);
                        await rateLimiter.expire(identifier, 60);
                    }
                } catch (redisError) {
                    logger.error(
                        `Redis operation failed for ${identifier}:`,
                        redisError
                    );
                }

                next();
            } catch (error) {
                logger.error('Rate limiter middleware error:', error);
                next();
            }
        });

        app.use('/api/v1', projectRoutes);
        app.use('/api/v1', taskRoutes);
        app.use('/api/v1', collaboratorRoutes);

        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
})();
