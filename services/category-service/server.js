const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/category-service';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB (Category Service)'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Category Service',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/categories', categoryRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Category Microservice',
        developer: 'Chaker Allah Dimassi',
        team: 'TechWin',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            categories: '/categories',
            'GET /categories': 'Get all categories',
            'POST /categories': 'Create a category',
            'GET /categories/:id': 'Get category by ID',
            'PUT /categories/:id': 'Update category',
            'DELETE /categories/:id': 'Delete category',
            'PATCH /categories/:id/toggle': 'Toggle category active status'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Category Service running on port ${PORT}`);
});
