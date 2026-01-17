import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // Import mongoose
import connectDB from './config/database';
import applicationRoutes from './routes/applicationRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB 
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter); // Apply to all API routes

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/applications', applicationRoutes);

// Handle 404
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`
    🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
    📍 Port: ${PORT}
    🌐 URL: http://localhost:${PORT}
    📊 API: http://localhost:${PORT}/api/applications
    🩺 Health: http://localhost:${PORT}/health
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err.message);
  
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;