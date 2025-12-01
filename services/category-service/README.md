# Category Service

Microservice for managing transaction categories in the banking system.

**Developer:** Chaker Allah Dimassi  
**Team:** TechWin  
**Port:** 3002

## Overview

The Category Service is a standalone microservice that manages transaction categories. Categories help users organize and track their transactions by type (income, expense, transfer, other).

## Features

- ✅ Create, read, update, delete categories
- ✅ Filter categories by type and active status
- ✅ Toggle category active/inactive status
- ✅ Default categories pre-seeded
- ✅ Category validation and uniqueness checks

## API Endpoints

**Base URL:** `http://localhost:3002`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |
| POST | `/categories` | Create a new category |
| GET | `/categories/:id` | Get category by ID |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| PATCH | `/categories/:id/toggle` | Toggle active status |
| GET | `/health` | Health check |

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file:
```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/category-service
```

### 3. Seed Default Categories
```bash
node scripts/seed-categories.js
```

### 4. Start Server
```bash
npm run dev
# or
npm start
```

## Default Categories

The service comes with 14 pre-seeded categories:

### Income Categories:
- 💰 Salary
- 💼 Freelance
- 📈 Investment
- 🎁 Gift

### Expense Categories:
- 🍔 Food
- 🚗 Transport
- 💡 Bills
- 🛍️ Shopping
- 🎬 Entertainment
- 🏥 Healthcare
- 📚 Education

### Transfer Categories:
- 💾 Savings
- 📋 Loan Payment

### Other:
- 📁 Other

## Database

- **Database:** MongoDB
- **Collection:** `categories`
- **Default URI:** `mongodb://localhost:27017/category-service`

## Category Model

```javascript
{
  categoryId: String (unique),
  name: String (required, unique),
  description: String,
  type: 'income' | 'expense' | 'transfer' | 'other',
  color: String (hex color),
  icon: String (emoji),
  isDefault: Boolean,
  isActive: Boolean,
  usageCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Example Requests

### Create Category
```bash
curl -X POST http://localhost:3002/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Restaurant",
    "description": "Restaurant expenses",
    "type": "expense",
    "color": "#EF4444",
    "icon": "🍽️"
  }'
```

### Get All Categories
```bash
curl http://localhost:3002/categories
```

### Get Categories by Type
```bash
curl http://localhost:3002/categories?type=expense
```

## Testing

See `POSTMAN_CATEGORIES_GUIDE.md` in the transactions-service folder for complete Postman testing guide.

## Architecture

This service follows the microservices architecture pattern:
- Separate database (category-service)
- Independent deployment
- RESTful API
- Can be called by other services (transactions, accounts, etc.)

## Integration

Other services can call the Category Service to:
- Get available categories for transaction categorization
- Validate category IDs
- Get category metadata (color, icon, type)

## License

ISC

