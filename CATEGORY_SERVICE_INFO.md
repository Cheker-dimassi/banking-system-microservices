# 📦 Category Microservice

The **Category** functionality has been moved to its own dedicated microservice.

## 🚀 Service Details
- **Path**: `services/category-service`
- **Port**: `3002`
- **Database**: MongoDB (Collection: `categories`)
- **Status**: Running ✅

## 🔗 API Endpoints
Base URL: `http://localhost:3002`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |
| POST | `/categories` | Create a new category |
| GET | `/categories/:id` | Get category by ID |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| GET | `/health` | Health check |

## 🛠️ How to Run
The service is already running. If you need to restart it:
```bash
cd services/category-service
npm start
```

## 📝 Postman Update
Please update your Postman collection for Category endpoints to use **port 3002** instead of 3001.
Example: `http://localhost:3002/categories`
