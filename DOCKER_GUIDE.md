# 🐳 DOCKER DEPLOYMENT GUIDE

## 📋 PREREQUISITES

- Docker installed
- Docker Compose installed
- At least 4GB RAM available

---

## 🚀 QUICK START

### **Start Everything:**
```bash
docker-compose up -d
```

### **View Logs:**
```bash
docker-compose logs -f
```

### **Stop Everything:**
```bash
docker-compose down
```

---

## 📊 SERVICES

When running, you'll have:

| Service | Port | URL |
|---------|------|-----|
| **API Gateway** | 3000 | http://localhost:3000 |
| Service Discovery | 8500 | http://localhost:8500 |
| Transactions | 3001 | http://localhost:3001 |
| Categories | 3002 | http://localhost:3002 |
| Accounts | 3004 | http://localhost:3004 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## 🔄 DOCKER COMMANDS

### **Build all services:**
```bash
docker-compose build
```

### **Start specific service:**
```bash
docker-compose up -d gateway
```

### **View service logs:**
```bash
docker-compose logs -f gateway
docker-compose logs -f service-discovery
docker-compose logs -f transactions-service
```

### **Restart a service:**
```bash
docker-compose restart gateway
```

### **Stop all services:**
```bash
docker-compose down
```

### **Stop and remove volumes:**
```bash
docker-compose down -v
```

---

## 🔍 CHECKING STATUS

### **List running containers:**
```bash
docker-compose ps
```

### **Check service health:**
```bash
# Gateway
curl http://localhost:3000/health

# Service Discovery
curl http://localhost:8500/health

# Registered Services
curl http://localhost:8500/services
```

---

## 🎯 STARTUP SEQUENCE

Docker Compose starts services in this order:

1. **MongoDB** (with health check)
2. **Service Discovery** (port 8500)
3. **Microservices** (parallel):
   - Transactions (3001)
   - Categories (3002)
   - Accounts (3004)
4. **Gateway** (3000) - after services are registered

---

## 📝 ENVIRONMENT VARIABLES

Each service uses these variables:

**Service Discovery:**
```
REGISTRY_PORT=8500
NODE_ENV=production
```

**Gateway:**
```
GATEWAY_PORT=3000
SERVICE_REGISTRY_URL=http://service-discovery:8500
```

**Microservices:**
```
PORT=300X
MONGODB_URI=mongodb://mongodb:27017/service-name
SERVICE_REGISTRY_URL=http://service-discovery:8500
```

---

## 🔧 DEVELOPMENT MODE

For development with hot reload:

```bash
# Use local npm run dev instead
npm run dev
```

Docker is for **production deployment**.

---

## 🎬 DEMO WORKFLOW

### **1. Start all services:**
```bash
docker-compose up -d
```

### **2. Wait for services to be ready:**
```bash
docker-compose logs -f | grep "Registered with service registry"
```

### **3. Verify discovery:**
```bash
curl http://localhost:8500/services
```

### **4. Test via Gateway:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/transactions
```

---

## 📊 MONITORING

### **View all logs:**
```bash
docker-compose logs -f
```

### **View specific service:**
```bash
docker-compose logs -f gateway
```

### **Check resource usage:**
```bash
docker stats
```

---

## 🐛 TROUBLESHOOTING

### **Service won't start:**
```bash
# Check logs
docker-compose logs service-name

# Rebuild
docker-compose build service-name
docker-compose up -d service-name
```

### **Port already in use:**
```bash
# Stop conflicting service
docker-compose down

# Or change ports in docker-compose.yml
```

### **Database connection issues:**
```bash
# Check MongoDB health
docker-compose exec mongodb mongosh --eval "db.runCommand({ping: 1})"

# Restart MongoDB
docker-compose restart mongodb
```

---

## 🔄 UPDATING SERVICES

### **After code changes:**
```bash
# Rebuild and restart
docker-compose build service-name
docker-compose up -d service-name
```

### **Update all:**
```bash
docker-compose build
docker-compose up -d
```

---

## 📦 PRODUCTION DEPLOYMENT

### **Using Docker Swarm:**
```bash
docker stack deploy -c docker-compose.yml banking-system
```

### **Using Kubernetes:**
Convert docker-compose.yml using kompose:
```bash
kompose convert
kubectl apply -f .
```

---

## ✅ VERIFICATION CHECKLIST

After `docker-compose up -d`:

- [ ] MongoDB running: `docker-compose ps mongodb`
- [ ] Service Discovery up: `curl http://localhost:8500/health`
- [ ] All services registered: `curl http://localhost:8500/services`
- [ ] Gateway responding: `curl http://localhost:3000/health`
- [ ] Can make transactions: `curl http://localhost:3000/api/transactions`

---

## 🎯 POSTMAN WITH DOCKER

**No changes needed!**

Still use:
```
http://localhost:3000/api/transactions/*
http://localhost:3000/api/categories/*
http://localhost:3000/api/mouvements/*
```

Gateway handles everything!

---

**DOCKER SETUP COMPLETE! READY FOR CONTAINERIZED DEPLOYMENT! 🎉**

