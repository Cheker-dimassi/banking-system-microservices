# Postman Testing Guide: Category Service

Complete testing guide for all Category Management endpoints.

**Base URL:** `http://localhost:3002`

**Note:** Categories are now a separate microservice running on port 3002.

---

## 📁 Categories: Transaction Categories Management

### 1. Create Category

**Purpose:** Create a new transaction category.

**Request:**
```
POST http://localhost:3002/categories
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**

**Example 1: Basic Category**
```json
{
  "name": "Restaurant",
  "description": "Restaurant and dining expenses",
  "type": "expense",
  "color": "#EF4444",
  "icon": "🍽️"
}
```

**Example 2: Income Category**
```json
{
  "name": "Bonus",
  "description": "Year-end bonus",
  "type": "income",
  "color": "#10B981",
  "icon": "🎉"
}
```

**Example 3: Minimal (Only Name)**
```json
{
  "name": "Miscellaneous"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "category": {
    "categoryId": "CAT_1738047821234_ABC123",
    "name": "Restaurant",
    "description": "Restaurant and dining expenses",
    "type": "expense",
    "color": "#EF4444",
    "icon": "🍽️",
    "isDefault": false,
    "isActive": true,
    "usageCount": 0,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Category Types:**
- `income` - For income transactions
- `expense` - For expense transactions
- `transfer` - For transfer transactions
- `other` - For other transactions (default)

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3002/categories`
3. Body → raw → JSON

---

### 2. Get All Categories

**Purpose:** Get all categories with optional filtering.

**Request:**
```
GET http://localhost:3002/categories
GET http://localhost:3002/categories?type=expense
GET http://localhost:3002/categories?isActive=true
GET http://localhost:3002/categories?type=income&isActive=true
```

**Headers:**
```
Content-Type: application/json
```

**Query Parameters (Optional):**
- `type` (optional): Filter by type (`income`, `expense`, `transfer`, `other`)
- `isActive` (optional): Filter by active status (`true` or `false`)

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "count": 14,
  "categories": [
    {
      "categoryId": "CAT_1738047821234_ABC123",
      "name": "Food",
      "description": "Food and groceries",
      "type": "expense",
      "color": "#EF4444",
      "icon": "🍔",
      "isDefault": true,
      "isActive": true,
      "usageCount": 5,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "categoryId": "CAT_1738047821235_XYZ789",
      "name": "Salary",
      "description": "Monthly salary income",
      "type": "income",
      "color": "#10B981",
      "icon": "💰",
      "isDefault": true,
      "isActive": true,
      "usageCount": 12,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Test Cases:**
- ✅ Get all categories: `/categories`
- ✅ Get expense categories: `/categories?type=expense`
- ✅ Get income categories: `/categories?type=income`
- ✅ Get active categories: `/categories?isActive=true`
- ✅ Combined filter: `/categories?type=expense&isActive=true`

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3002/categories`
3. Optional: Add query parameters in Params tab

---

### 3. Get Category by ID

**Purpose:** Get a specific category by its ID.

**Request:**
```
GET http://localhost:3002/categories/CAT_1738047821234_ABC123
```

**Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Category ID (e.g., `CAT_1738047821234_ABC123`) or MongoDB `_id`

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "category": {
    "categoryId": "CAT_1738047821234_ABC123",
    "name": "Food",
    "description": "Food and groceries",
    "type": "expense",
    "color": "#EF4444",
    "icon": "🍔",
    "isDefault": true,
    "isActive": true,
    "usageCount": 5,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Category not found",
  "hint": "Use GET /transactions/categories to list all categories"
}
```

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3002/categories/{{category_id}}`
3. Use environment variable: `category_id = CAT_1738047821234_ABC123`

---

### 4. Update Category

**Purpose:** Update an existing category.

**Request:**
```
PUT http://localhost:3002/categories/CAT_1738047821234_ABC123
```

**Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Category ID

**Body (JSON):**

**Example 1: Update Name and Description**
```json
{
  "name": "Dining Out",
  "description": "Restaurants and cafes"
}
```

**Example 2: Update Color and Icon**
```json
{
  "color": "#F59E0B",
  "icon": "🍕"
}
```

**Example 3: Update Type**
```json
{
  "type": "expense"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "category": {
    "categoryId": "CAT_1738047821234_ABC123",
    "name": "Dining Out",
    "description": "Restaurants and cafes",
    "type": "expense",
    "color": "#F59E0B",
    "icon": "🍕",
    "isDefault": false,
    "isActive": true,
    "usageCount": 5,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Note:** You can update any field except `categoryId`. Partial updates are supported.

**Postman Setup:**
1. Method: `PUT`
2. URL: `http://localhost:3002/categories/{{category_id}}`
3. Body → raw → JSON

---

### 5. Delete Category

**Purpose:** Delete a category (cannot delete default categories).

**Request:**
```
DELETE http://localhost:3002/categories/CAT_1738047821234_ABC123
```

**Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Category ID

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "deletedCategory": {
    "categoryId": "CAT_1738047821234_ABC123",
    "name": "Restaurant"
  }
}
```

**Error Response (403 Forbidden - Default Category):**
```json
{
  "success": false,
  "error": "Cannot delete default category"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Category not found"
}
```

**Postman Setup:**
1. Method: `DELETE`
2. URL: `http://localhost:3002/categories/{{category_id}}`

---

### 6. Toggle Category Active Status

**Purpose:** Activate or deactivate a category.

**Request:**
```
PATCH http://localhost:3002/categories/CAT_1738047821234_ABC123/toggle
```

**Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Category ID

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deactivated",
  "category": {
    "categoryId": "CAT_1738047821234_ABC123",
    "name": "Restaurant",
    "isActive": false
  }
}
```

**Postman Setup:**
1. Method: `PATCH`
2. URL: `http://localhost:3002/categories/{{category_id}}/toggle`

---

### 7. Get Category Statistics

**Purpose:** Get statistics for a specific category (transaction count, amounts, etc.).

**Request:**
```
GET http://localhost:3002/categories/CAT_1738047821234_ABC123/statistics
```

**Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Category ID

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "statistics": {
    "categoryId": "CAT_1738047821234_ABC123",
    "categoryName": "Food",
    "totalTransactions": 25,
    "totalAmount": 1500.50,
    "averageAmount": 60.02,
    "deposits": 0,
    "withdrawals": 15,
    "transfers": 10,
    "lastUsed": "2024-01-15T14:30:00.000Z"
  }
}
```

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3002/categories/{{category_id}}/statistics`

---

## Default Categories (Pre-seeded)

The following categories are automatically created:

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

---

## Complete Test Flow

### Step-by-Step Testing:

**1. Get All Categories**
```
GET /categories
```
✅ See all available categories

**2. Create Custom Category**
```
POST /categories
Body: { "name": "Gym", "type": "expense", "color": "#8B5CF6", "icon": "💪" }
```
✅ Create your own category

**3. Get Category by ID**
```
GET /categories/{{category_id}}
```
✅ Get specific category details

**4. Update Category**
```
PUT /categories/{{category_id}}
Body: { "description": "Updated description" }
```
✅ Update category information

**5. Toggle Category**
```
PATCH /categories/{{category_id}}/toggle
```
✅ Activate/deactivate category

**6. Delete Category (if not default)**
```
DELETE /categories/{{category_id}}
```
✅ Delete custom category

---

## Postman Environment Variables

Create these variables in your Postman environment:

```
base_url = http://localhost:3001
category_id = CAT_1738047821234_ABC123
```

**Use in requests:**
- `{{base_url}}/categories`
- `{{base_url}}/categories/{{category_id}}`
- `{{base_url}}/categories/{{category_id}}/toggle`

---

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/categories` | POST | Create category |
| `/categories` | GET | List all categories |
| `/categories/:id` | GET | Get category |
| `/categories/:id` | PUT | Update category |
| `/categories/:id` | DELETE | Delete category |
| `/categories/:id/toggle` | PATCH | Toggle active status |

---

## Testing Checklist

- [ ] Create a new category
- [ ] Get all categories
- [ ] Get categories filtered by type (expense)
- [ ] Get categories filtered by type (income)
- [ ] Get active categories only
- [ ] Get category by ID
- [ ] Update category name
- [ ] Update category description
- [ ] Update category color and icon
- [ ] Update category type
- [ ] Get category statistics
- [ ] Toggle category active status
- [ ] Try to delete default category (should fail)
- [ ] Delete custom category
- [ ] Test with invalid category ID (should return 404)

---

**All Category endpoints are ready for testing!** 🚀

