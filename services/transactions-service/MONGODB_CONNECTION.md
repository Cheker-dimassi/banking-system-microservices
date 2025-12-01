# MongoDB Connection Guide

## Connection String

### Default Local Connection
```
mongodb://localhost:27017/transaction-service
```

### Alternative Formats

**Full connection string:**
```
mongodb://localhost:27017/transaction-service
```

**With authentication (if needed):**
```
mongodb://username:password@localhost:27017/transaction-service
```

**For MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster.mongodb.net/transaction-service
```

---

## Connection Methods

### 1. MongoDB Compass (Desktop App)

1. **Download**: https://www.mongodb.com/try/download/compass
2. **Open MongoDB Compass**
3. **Paste connection string**: `mongodb://localhost:27017/transaction-service`
4. **Click "Connect"**

**Screenshot steps:**
- Open Compass
- New Connection → Paste string → Connect

---

### 2. VS Code MongoDB Extension

1. **Install Extension**: 
   - Open VS Code
   - Extensions → Search "MongoDB for VS Code"
   - Install by MongoDB

2. **Connect**:
   - Click MongoDB icon in sidebar
   - Click "Add Connection"
   - Paste: `mongodb://localhost:27017/transaction-service`
   - Click "Connect"

---

### 3. MongoDB Shell (mongosh)

```bash
mongosh "mongodb://localhost:27017/transaction-service"
```

Or simply:
```bash
mongosh
use transaction-service
```

---

### 4. Connection String Components

```
mongodb://[username:password@]host[:port][/database][?options]
```

- **Protocol**: `mongodb://` (or `mongodb+srv://` for Atlas)
- **Host**: `localhost` (or your server IP)
- **Port**: `27017` (default MongoDB port)
- **Database**: `transaction-service`

---

## Quick Setup

### Step 1: Make sure MongoDB is running

**Windows:**
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# If not running, start it
net start MongoDB
```

**Or check in Task Manager** → Services → MongoDB

### Step 2: Test Connection

**Using mongosh:**
```bash
mongosh mongodb://localhost:27017
```

**Using Node.js:**
```javascript
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/transaction-service')
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Error:', err));
```

---

## Common Connection Strings

### Local Development (Default)
```
mongodb://localhost:27017/transaction-service
```

### Local with Custom Port
```
mongodb://localhost:27018/transaction-service
```

### Docker MongoDB
```
mongodb://localhost:27017/transaction-service
```
(If MongoDB is in Docker, use `localhost` or container name)

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/transaction-service?retryWrites=true&w=majority
```

---

## Troubleshooting

### "Cannot connect to MongoDB"

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   Get-Service MongoDB
   
   # Or check Task Manager → Services
   ```

2. **Check MongoDB port:**
   ```bash
   netstat -an | findstr 27017
   ```

3. **Start MongoDB manually:**
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # Or run mongod directly
   mongod --dbpath "C:\data\db"
   ```

### "Connection refused"

- MongoDB service not started
- Wrong port (check if it's 27017)
- Firewall blocking connection

### "Authentication failed"

- Check username/password
- For local dev, usually no auth needed
- Remove `username:password@` from connection string

---

## Environment Variable

In your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/transaction-service
```

The server will use this if set, otherwise defaults to the same string.

---

## Verify Connection

Once connected, you should see:
- Database: `transaction-service`
- Collections: `accounts`, `transactions`
- Documents: Your seeded accounts and transactions

---

## Quick Test

**Test connection in Node.js:**
```javascript
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/transaction-service')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    mongoose.connection.close();
  })
  .catch(err => console.error('❌ Error:', err));
```

Run: `node test-connection.js`

---

**Ready to connect!** Use: `mongodb://localhost:27017/transaction-service` 🚀

