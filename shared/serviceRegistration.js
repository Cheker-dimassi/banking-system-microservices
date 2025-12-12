const axios = require('axios');

class ServiceRegistration {
    constructor(serviceName, servicePort, registryUrl = 'http://localhost:8500') {
        this.serviceName = serviceName;
        this.servicePort = servicePort;
        this.registryUrl = registryUrl;
        this.serviceId = null;
        this.heartbeatInterval = null;
    }

    async register() {
        try {
            const response = await axios.post(`${this.registryUrl}/register`, {
                name: this.serviceName,
                url: 'localhost',
                port: this.servicePort,
                healthEndpoint: '/health'
            });

            this.serviceId = response.data.serviceId;
            console.log(`✅ Registered with service registry: ${this.serviceId}`);

            // Start sending heartbeats
            this.startHeartbeat();

            // Deregister on process exit
            process.on('SIGINT', () => this.deregister());
            process.on('SIGTERM', () => this.deregister());

            return response.data;
        } catch (error) {
            console.warn(`⚠️  Failed to register with service registry: ${error.message}`);
            console.warn('   Continuing without service discovery...');
            return null;
        }
    }

    startHeartbeat() {
        // Send heartbeat every 20 seconds
        this.heartbeatInterval = setInterval(async () => {
            try {
                await axios.post(`${this.registryUrl}/heartbeat/${this.serviceId}`);
                console.log(`💓 Heartbeat sent to registry`);
            } catch (error) {
                console.warn(`⚠️  Heartbeat failed: ${error.message}`);
            }
        }, 20000);
    }

    async deregister() {
        if (!this.serviceId) return;

        try {
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
            }

            await axios.delete(`${this.registryUrl}/deregister/${this.serviceId}`);
            console.log(`❌ Deregistered from service registry: ${this.serviceId}`);
            process.exit(0);
        } catch (error) {
            console.warn(`⚠️  Failed to deregister: ${error.message}`);
            process.exit(1);
        }
    }
}

async function discoverService(serviceName, registryUrl = 'http://localhost:8500') {
    try {
        const response = await axios.get(`${registryUrl}/discover/${serviceName}`);
        return response.data.service.fullUrl;
    } catch (error) {
        console.warn(`⚠️  Service discovery failed for ${serviceName}: ${error.message}`);
        return null;
    }
}

module.exports = { ServiceRegistration, discoverService };
