import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth-simple';
import { uploadRoutes } from './routes/uploads';
import { activityRoutes } from './routes/activities';
import { siteRoutes } from './routes/sites';
import { periodRoutes } from './routes/periods';
import { calcRoutes } from './routes/calculations';
import { projectRoutes } from './routes/projects';
import { reportingRoutes } from './routes/reporting';
import { customerRoutes } from './routes/customers';
import { emissionsInventoryRoutes } from './routes/emissionsInventory';
import { ingestRoutes } from './routes/ingest';

console.log('✅ All route modules imported successfully');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration - Allow all localhost origins for development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost and 127.0.0.1 origins
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow configured origin
    if (origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow all in development
  },
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Co-Lab VERITAS™ API Server',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    name: 'Co-Lab VERITAS™'
  });
});

// Rate limiting for API routes only (not health checks)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit
  message: 'Too many requests from this IP, please try again later.'
});

// API routes
console.log('✅ Registering routes...');
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/uploads', apiLimiter, uploadRoutes);
app.use('/api/activities', apiLimiter, activityRoutes);
app.use('/api/sites', apiLimiter, siteRoutes);
app.use('/api/periods', apiLimiter, periodRoutes);
app.use('/api/calc', apiLimiter, calcRoutes);
app.use('/api/projects', apiLimiter, projectRoutes);
app.use('/api/reporting', apiLimiter, reportingRoutes);
app.use('/api/customers', apiLimiter, customerRoutes);
app.use('/api/emissions-inventory', apiLimiter, emissionsInventoryRoutes);
app.use('/api/ingest', apiLimiter, ingestRoutes);
console.log('✅ All routes registered successfully');

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

// Error handling
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 Co-Lab VERITAS™ API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`📤 Uploads: http://localhost:${PORT}/api/uploads`);
  console.log(`📋 Activities: http://localhost:${PORT}/api/activities`);
  console.log(`📍 Sites: http://localhost:${PORT}/api/sites`);
  console.log(`📅 Periods: http://localhost:${PORT}/api/periods`);
  console.log(`🧮 Calculations: http://localhost:${PORT}/api/calc`);
  console.log(`📊 Reporting: http://localhost:${PORT}/api/reporting`);
  console.log(`📥 Ingest: http://localhost:${PORT}/api/ingest`);
  console.log('');
  console.log('Ready to accept requests! 🎉');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
