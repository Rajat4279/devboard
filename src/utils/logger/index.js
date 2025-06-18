import winston, { format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const { combine, timestamp, label, printf, colorize } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        myFormat
    ),
    defaultMeta: { service: 'user-service' },

    transports: [
        new DailyRotateFile({
      filename: 'src/logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
    }),
    new DailyRotateFile({
      filename: 'src/logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
    }),
    ],
});

// In development, log to the console with colorized output
if (process.env.NODE_ENV !== 'development') {
    logger.add(
        new transports.Console({
            format: combine(colorize(), myFormat),
        })
    );
}

// Usage example:
// logger.log('warn', 'Logger initialized successfully');
