const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: 'running',
    timestamp: new Date().toISOString()
  });
});

// Service registry (simple in-memory registry)
const services = {
  transactions: {
    url: process.env.TRANSACTIONS_SERVICE_URL || 'http://localhost:3001',
    health: '/health'
  },
  categories: {
    url: process.env.CATEGORIES_SERVICE_URL || 'http://localhost:3002',
    health: '/health'
  }
};

// Proxy middleware for Transactions Service
app.use('/api/transactions', createProxyMiddleware({
  target: services.transactions.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/transactions': '' // Remove /api/transactions prefix
  },
  onError: (err, req, res) => {
    console.error('Transactions service error:', err.message);
    res.status(503).json({
      success: false,
      error: 'Transactions service unavailable',
      message: 'The transactions service is currently unavailable. Please try again later.'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Gateway] ${req.method} ${req.url} -> ${services.transactions.url}${req.url}`);
  }
}));

// Proxy middleware for Categories Service
app.use('/api/categories', createProxyMiddleware({
  target: services.categories.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/categories': '' // Remove /api/categories prefix
  },
  onError: (err, req, res) => {
    console.error('Categories service error:', err.message);
    res.status(503).json({
      success: false,
      error: 'Categories service unavailable',
      message: 'The categories service is currently unavailable. Please try again later.'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Gateway] ${req.method} ${req.url} -> ${services.categories.url}${req.url}`);
  }
}));

// API Documentation endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Banking System API Gateway',
    version: '1.0.0',
    description: 'Central entry point for all microservices',
    endpoints: {
      transactions: '/api/transactions',
      categories: '/api/categories',
      health: '/health'
    },
    services: Object.keys(services).map(key => ({
      name: key,
      url: services[key].url,
      status: 'registered'
    }))
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Proxying requests to:`);
  Object.keys(services).forEach(key => {
    console.log(`   - ${key}: ${services[key].url}`);
  });
  console.log(`\n📍 Access gateway at: http://localhost:${PORT}`);
  console.log(`📍 Transactions API: http://localhost:${PORT}/api/transactions`);
  console.log(`📍 Categories API: http://localhost:${PORT}/api/categories`);
});

