import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import promClient from 'prom-client';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { logError, logRequest } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 8080;
const API_VERSION = process.env.API_VERSION || 'v1';

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Correlation ID middleware
app.use((req, res, next) => {
  req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || Math.random().toString(36).substring(2, 15);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    
    // Record Prometheus metrics
    const durationInSeconds = duration / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(durationInSeconds);
    httpRequestsTotal.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
    
    logRequest(req, res, res.statusCode, duration);
    originalSend.call(this, data);
  };
  
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Routes
app.use(`/${API_VERSION}/products`, productRoutes);
app.use(`/${API_VERSION}/categories`, categoryRoutes);
app.use('/health', healthRoutes);

// Error handling
app.use((err, req, res, next) => {
  const duration = Date.now() - (req.startTime || Date.now());
  logRequest(req, res, 500, duration);
  logError(err, req);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Catalog service running on port ${PORT}`);
});