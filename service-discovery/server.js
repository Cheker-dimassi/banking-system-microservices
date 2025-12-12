const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// In-memory service registry
const services = new Map();

// Health check interval (30 seconds)
const HEALTH_CHECK_INTERVAL = 30000;
const SERVICE_TIMEOUT = 60000; // Remove service if no heartbeat for 60s

// Register a service
app.post('/register', (req, res) => {
    const { name, url, port, healthEndpoint = '/health' } = req.body;

    if (!name || !url || !port) {
        return res.status(400).json({
            success: false,
            error: 'name, url, and port are required'
        });
    }

    const serviceId = `${name}-${port}`;
    const service = {
        id: serviceId,
        name,
        url,
        port,
        healthEndpoint,
        status: 'up',
        lastHeartbeat: Date.now(),
        registeredAt: new Date()
    };

    services.set(serviceId, service);

    console.log(`✅ Service registered: ${name} at ${url}:${port}`);

    res.json({
        success: true,
        message: 'Service registered successfully',
        serviceId,
        service
    });
});

// Heartbeat endpoint
app.post('/heartbeat/:serviceId', (req, res) => {
    const { serviceId } = req.params;
    const service = services.get(serviceId);

    if (!service) {
        return res.status(404).json({
            success: false,
            error: 'Service not found'
        });
    }

    service.lastHeartbeat = Date.now();
    service.status = 'up';
    services.set(serviceId, service);

    res.json({ success: true, message: 'Heartbeat received' });
});

// Deregister a service
app.delete('/deregister/:serviceId', (req, res) => {
    const { serviceId } = req.params;

    if (services.delete(serviceId)) {
        console.log(`❌ Service deregistered: ${serviceId}`);
        res.json({ success: true, message: 'Service deregistered successfully' });
    } else {
        res.status(404).json({ success: false, error: 'Service not found' });
    }
});

// Get all services
app.get('/services', (req, res) => {
    const allServices = Array.from(services.values());
    res.json({
        success: true,
        count: allServices.length,
        services: allServices
    });
});

// Discover service by name
app.get('/discover/:serviceName', (req, res) => {
    const { serviceName } = req.params;
    const matchingServices = Array.from(services.values())
        .filter(s => s.name === serviceName && s.status === 'up');

    if (matchingServices.length === 0) {
        return res.status(404).json({
            success: false,
            error: `No healthy instances of ${serviceName} found`
        });
    }

    // Simple round-robin (just return first healthy instance)
    const service = matchingServices[0];

    res.json({
        success: true,
        service: {
            name: service.name,
            url: `${service.url}:${service.port}`,
            fullUrl: `http://${service.url}:${service.port}`
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'up',
        service: 'service-registry',
        registeredServices: services.size,
        uptime: process.uptime()
    });
});

// Periodic cleanup of stale services
setInterval(() => {
    const now = Date.now();
    let removed = 0;

    for (const [serviceId, service] of services.entries()) {
        if (now - service.lastHeartbeat > SERVICE_TIMEOUT) {
            console.log(`⚠️  Removing stale service: ${serviceId}`);
            services.delete(serviceId);
            removed++;
        }
    }

    if (removed > 0) {
        console.log(`🧹 Cleaned up ${removed} stale services`);
    }
}, HEALTH_CHECK_INTERVAL);

// Info endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Service Discovery Registry',
        version: '1.0.0',
        endpoints: {
            register: 'POST /register',
            deregister: 'DELETE /deregister/:serviceId',
            heartbeat: 'POST /heartbeat/:serviceId',
            discover: 'GET /discover/:serviceName',
            services: 'GET /services',
            health: 'GET /health'
        },
        registeredServices: Array.from(services.values()).map(s => ({
            name: s.name,
            url: `${s.url}:${s.port}`,
            status: s.status
        }))
    });
});

const PORT = process.env.REGISTRY_PORT || 8500;

app.listen(PORT, () => {
    console.log(`\n🔍 Service Registry running on port ${PORT}`);
    console.log(`📋 View all services: http://localhost:${PORT}/services`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health\n`);
});
