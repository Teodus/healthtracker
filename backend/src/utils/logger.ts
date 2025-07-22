import winston from 'winston';
import { env } from '@/config/env';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Error file transport
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
    }),
    // Combined file transport
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
    }),
  ],
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;