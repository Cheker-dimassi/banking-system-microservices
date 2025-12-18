const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Middleware - CORS configuration for frontend
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: 'running',
    timestamp: new Date().toISOString()
  });
});

// Service URLs from environment (Docker container names)
const services = {
  transactions: {
    url: process.env.TRANSACTIONS_SERVICE_URL || 'http://localhost:3001',
    health: '/health'
  },
  categories: {
    url: process.env.CATEGORIES_SERVICE_URL || 'http://localhost:3002',
    health: '/health'
  },
  accounts: {
    url: process.env.ACCOUNTS_SERVICE_URL || 'http://localhost:3004',
    health: '/health'
  }
};

// Proxy middleware for Transactions Service
app.use('/api/transactions', createProxyMiddleware({
  target: services.transactions.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/transactions': '/transactions'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.path} -> ${services.transactions.url}`);
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error] Transactions:', err.message);
    res.status(500).json({ error: 'Proxy error', service: 'transactions' });
  }
}));

// Proxy middleware for Categories Service
app.use('/api/categories', createProxyMiddleware({
  target: services.categories.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/categories': '/categories'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.path} -> ${services.categories.url}`);
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error] Categories:', err.message);
    res.status(500).json({ error: 'Proxy error', service: 'categories' });
  }
}));

// Proxy middleware for Accounts Service (Comptes)
app.use('/api/comptes', createProxyMiddleware({
  target: services.accounts.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/comptes': '/api/comptes'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.path} -> ${services.accounts.url}`);
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error] Accounts:', err.message);
    res.status(500).json({ error: 'Proxy error', service: 'accounts' });
  }
}));

// Proxy middleware for Mouvements
app.use('/api/mouvements', createProxyMiddleware({
  target: services.accounts.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/mouvements': '/api/mouvements'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.path} -> ${services.accounts.url}`);
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error] Mouvements:', err.message);
    res.status(500).json({ error: 'Proxy error', service: 'mouvements' });
  }
}));

// Root info endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'API Gateway',
    version: '1.0.0',
    status: 'running',
    services: {
      transactions: services.transactions.url,
      categories: services.categories.url,
      accounts: services.accounts.url
    },
    endpoints: {
      health: '/health',
      transactions: '/api/transactions',
      categories: '/api/categories',
      accounts: '/api/comptes',
      mouvements: '/api/mouvements'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Proxying requests to:`);
  Object.keys(services).forEach(key => {
    console.log(`   - ${key}: ${services[key].url}`);
  });
  console.log(`\n📍 Access gateway at: http://localhost:${PORT}`);
  console.log(`📍 Transactions API: http://localhost:${PORT}/api/transactions`);
  console.log(`📍 Categories API: http://localhost:${PORT}/api/categories`);
  console.log(`📍 Accounts API: http://localhost:${PORT}/api/comptes`);
  console.log(`📍 Movements API: http://localhost:${PORT}/api/mouvements\n`);
});
