# Microservices Collaboration Guide

Based on the reference repository: https://github.com/oussemasellami/micro-serv.git

## 📋 Reference Repository Structure

The teacher's reference repository includes:
- **entrypoint** - Main entry point for the application
- **getway** (Gateway) - API Gateway for routing requests
- **service-discovery** - Service discovery mechanism
- **service1-user** - Example user service
- **service2-voiture** - Example car service

## 🏗️ Your Current Project Structure

You already have:
- ✅ **transactions-service** (Port 3001) - Transaction management
- ✅ **category-service** (Port 3002) - Category management
- 📦 **package.json** (Root) - Scripts to run all services

## 👥 Setting Up Collaboration

### Option 1: Shared Repository (Recommended for Team Projects)

1. **Add Team Members as Collaborators**
   - Go to: https://github.com/Cheker-dimassi/banking-system-microservices/settings/access
   - Click "Add people" → Invite your team members
   - They'll receive an email invitation

2. **Each Team Member Should:**
   ```bash
   git clone https://github.com/Cheker-dimassi/banking-system-microservices.git
   cd banking-system-microservices
   npm install  # Install root dependencies
   cd services/transactions-service && npm install
   cd ../category-service && npm install
   ```

### Option 2: Fork & Pull Request Workflow

1. Each member forks the repository
2. Create feature branches: `git checkout -b feature/service-name`
3. Make changes and push to your fork
4. Create Pull Requests to merge back

## 🌿 Branching Strategy

### Recommended Branch Structure:

```
main (production-ready code)
├── develop (integration branch)
│   ├── feature/transactions-service
│   ├── feature/category-service
│   ├── feature/auth-service
│   ├── feature/gateway
│   └── feature/service-discovery
```

### Creating Feature Branches:

```bash
# Create and switch to a new feature branch
git checkout -b feature/new-service-name

# Work on your service
# ... make changes ...

# Commit your changes
git add .
git commit -m "feat: add new service functionality"

# Push to remote
git push origin feature/new-service-name
```

## 🔧 Adding New Microservices

### Step-by-Step Process:

1. **Create Service Directory:**
   ```bash
   mkdir services/your-service-name
   cd services/your-service-name
   npm init -y
   ```

2. **Install Dependencies:**
   ```bash
   npm install express mongoose dotenv cors
   npm install --save-dev nodemon
   ```

3. **Create Basic Structure:**
   ```
   services/your-service-name/
   ├── server.js
   ├── package.json
   ├── .env
   ├── controllers/
   ├── models/
   ├── routes/
   └── middleware/
   ```

4. **Update Root package.json:**
   Add your service to the scripts:
   ```json
   {
     "scripts": {
       "dev": "concurrently \"npm run dev:transactions\" \"npm run dev:category\" \"npm run dev:your-service\"",
       "dev:your-service": "cd services/your-service-name && npm run dev"
     }
   }
   ```

5. **Choose a Port:**
   - Transactions: 3001 ✅
   - Category: 3002 ✅
   - Your Service: 3003, 3004, etc.

## 🚪 API Gateway Setup (Following Reference Pattern)

Based on the reference repo, you'll need a gateway. Here's how to set one up:

### 1. Create Gateway Service:

```bash
mkdir gateway
cd gateway
npm init -y
npm install express http-proxy-middleware cors dotenv
```

### 2. Gateway Structure:

```
gateway/
├── server.js
├── package.json
└── routes/
    └── proxy.js
```

### 3. Example Gateway Code:

```javascript
// gateway/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Proxy routes
app.use('/api/transactions', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/transactions': '' }
}));

app.use('/api/categories', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/categories': '' }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
```

## 🔍 Service Discovery (Optional - Following Reference)

For service discovery, you can use:
- **Consul** (like in reference)
- **Eureka** (Spring Cloud)
- **Simple registry service** (custom)

## 📝 Team Workflow Best Practices

### 1. Before Starting Work:
```bash
git pull origin main  # Get latest changes
git checkout -b feature/your-feature
```

### 2. Regular Commits:
```bash
git add .
git commit -m "feat: description of what you added"
git push origin feature/your-feature
```

### 3. Commit Message Format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Adding tests

### 4. Before Merging:
- Test your service locally
- Update documentation
- Ensure no conflicts with main branch

## 🎯 Assignment Distribution Example

Based on microservices architecture, divide work like this:

| Team Member | Service | Port | Responsibilities |
|------------|---------|------|-------------------|
| Member 1 | Transactions | 3001 | Transaction CRUD, Reports |
| Member 2 | Categories | 3002 | Category Management |
| Member 3 | Auth Service | 3003 | Authentication, Authorization |
| Member 4 | Gateway | 3000 | API Gateway, Routing ✅ (Already set up) |
| Member 5 | Service Discovery | 3004 | Service Registry |

## 🚀 Quick Start for New Team Members

```bash
# 1. Clone repository
git clone https://github.com/Cheker-dimassi/banking-system-microservices.git
cd banking-system-microservices

# 2. Install dependencies
npm install
cd gateway && npm install && cd ..
cd services/transactions-service && npm install && cd ../..
cd services/category-service && npm install && cd ../..

# 3. Set up environment
cp env.example .env
# Edit .env with your MongoDB connection string

# 4. Start all services (Gateway + Transactions + Categories)
npm run dev

# 5. Test endpoints
# Gateway: http://localhost:3000
# Transactions (via gateway): http://localhost:3000/api/transactions
# Categories (via gateway): http://localhost:3000/api/categories
# Transactions (direct): http://localhost:3001
# Categories (direct): http://localhost:3002
```

## 📚 Additional Resources

- Reference Repository: https://github.com/oussemasellami/micro-serv.git
- Git Collaboration: https://docs.github.com/en/get-started/quickstart/contributing-to-projects
- Microservices Patterns: https://microservices.io/patterns/

## ⚠️ Important Notes

1. **Never commit `.env` files** - They contain sensitive data
2. **Always pull before pushing** - Avoid merge conflicts
3. **Test locally before pushing** - Use `npm run dev` to test
4. **Communicate with team** - Discuss port assignments and API contracts
5. **Document your service** - Add README.md in each service folder

