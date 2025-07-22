import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import logger, { stream } from './utils/logger';
import { errorHandler } from './middleware/error';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      env.FRONTEND_URL,
      'http://localhost:8080',
      'http://localhost:5173',
    ];
    
    // Allow requests with no origin (Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Request logging
app.use(morgan('combined', { stream }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT, 10);
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📍 Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;