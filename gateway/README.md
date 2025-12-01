# API Gateway

Central entry point for all microservices. Routes requests to appropriate services.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start gateway
npm run dev
```

Gateway runs on **port 3000** by default.

## 📡 Routing

The gateway routes requests as follows:

- **Transactions API**: `http://localhost:3000/api/transactions/*` → `http://localhost:3001/*`
- **Categories API**: `http://localhost:3000/api/categories/*` → `http://localhost:3002/*`

## 📝 Example Requests

### Through Gateway:
```bash
# Get all transactions
GET http://localhost:3000/api/transactions

# Get all categories
GET http://localhost:3000/api/categories

# Create a deposit
POST http://localhost:3000/api/transactions/deposit
```

### Direct Service Access (still works):
```bash
# Get all transactions (direct)
GET http://localhost:3001/transactions

# Get all categories (direct)
GET http://localhost:3002/categories
```

## 🔧 Configuration

Set environment variables in `.env`:

```env
GATEWAY_PORT=3000
TRANSACTIONS_SERVICE_URL=http://localhost:3001
CATEGORIES_SERVICE_URL=http://localhost:3002
```

## 🏗️ Architecture

```
Client Request
    ↓
API Gateway (Port 3000)
    ↓
    ├──→ Transactions Service (Port 3001)
    └──→ Categories Service (Port 3002)
```

## ✨ Features

- ✅ Request routing to microservices
- ✅ Error handling for unavailable services
- ✅ CORS enabled
- ✅ Health check endpoint
- ✅ Service registry (simple in-memory)

## 🔮 Future Enhancements

- [ ] JWT Authentication
- [ ] Rate limiting
- [ ] Request/Response logging
- [ ] Load balancing
- [ ] Circuit breaker pattern
- [ ] Service discovery integration
