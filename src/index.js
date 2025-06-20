import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger/index.js';
import authRoutes from './routes/auth.route.js';
import projectRoutes from './routes/project.route.js';

const PORT = process.env.PORT || 8000;
const app = express();

dotenv.config({
    path: '.env',
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: '*',
        credentials: true,
    })
);

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the API',
    });
});

app.use('/api/v1', authRoutes);
app.use('/api/v1', projectRoutes);

app.listen(PORT, () => {
    logger.log('info', `Server is running on port ${PORT}`);
});
