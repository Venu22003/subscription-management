# 🔌 API Documentation

Complete reference for all API endpoints in the Subscription Manager application.

## Base URL

```
Development: http://localhost:5000/api/v1
Production:  https://your-api-domain.vercel.app/api/v1
```

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email."
}
```

**Validation Rules:**
- Name: 2-50 characters
- Email: Valid email format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Passwords must match

---

### Login User

**POST** `/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Refresh Token

**POST** `/auth/refresh-token`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Logout

**POST** `/auth/logout`

Invalidate user's refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Forgot Password

**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Reset Password

**POST** `/auth/reset-password/:token`

Reset password using token from email.

**URL Parameters:**
- `token`: Reset token from email

**Request Body:**
```json
{
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 💳 Subscription Endpoints

### Get All Subscriptions

**GET** `/subscriptions`

Retrieve all subscriptions for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (active/paused/cancelled)
- `category` (optional): Filter by category ID
- `search` (optional): Search by subscription name
- `sortBy` (optional): Sort field (name/price/nextBillingDate)
- `sortOrder` (optional): Sort direction (asc/desc)

**Example Request:**
```
GET /subscriptions?page=1&limit=10&status=active&sortBy=price&sortOrder=desc
```

**Response (200):**
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Netflix",
      "description": "Streaming service",
      "price": 15.99,
      "currency": "USD",
      "billingCycle": "monthly",
      "nextBillingDate": "2024-12-01T00:00:00.000Z",
      "category": {
        "id": "507f1f77bcf86cd799439012",
        "name": "Entertainment",
        "icon": "🎬"
      },
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

### Get Single Subscription

**GET** `/subscriptions/:id`

Retrieve a specific subscription by ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Subscription ID

**Response (200):**
```json
{
  "success": true,
  "subscription": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Netflix",
    "description": "Streaming service",
    "price": 15.99,
    "currency": "USD",
    "billingCycle": "monthly",
    "nextBillingDate": "2024-12-01T00:00:00.000Z",
    "category": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Entertainment",
      "icon": "🎬"
    },
    "status": "active",
    "paymentHistory": [
      {
        "date": "2024-11-01T00:00:00.000Z",
        "amount": 15.99,
        "status": "paid"
      }
    ],
    "totalSpent": 191.88,
    "paymentCount": 12,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### Create Subscription

**POST** `/subscriptions`

Create a new subscription.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Netflix",
  "description": "Streaming service",
  "price": 15.99,
  "currency": "USD",
  "billingCycle": "monthly",
  "nextBillingDate": "2024-12-01",
  "category": "507f1f77bcf86cd799439012",
  "status": "active",
  "autoRenew": true,
  "reminderDays": 3
}
```

**Required Fields:**
- `name`: 2-100 characters
- `price`: Positive number
- `billingCycle`: monthly/yearly/weekly/biannual/quarterly
- `nextBillingDate`: Future date
- `category`: Valid category ID

**Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Netflix",
    "price": 15.99,
    ...
  }
}
```

---

### Update Subscription

**PUT** `/subscriptions/:id`

Update an existing subscription.

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Subscription ID

**Request Body:**
```json
{
  "name": "Netflix Premium",
  "price": 19.99,
  "status": "active"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "subscription": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Netflix Premium",
    "price": 19.99,
    ...
  }
}
```

---

### Delete Subscription

**DELETE** `/subscriptions/:id`

Delete a subscription.

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Subscription ID

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription deleted successfully"
}
```

---

### Mark as Paid

**POST** `/subscriptions/:id/mark-paid`

Mark a subscription payment as paid and update next billing date.

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Subscription ID

**Request Body:**
```json
{
  "paymentDate": "2024-11-01",
  "amount": 15.99
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "subscription": {
    "id": "507f1f77bcf86cd799439011",
    "nextBillingDate": "2024-12-01T00:00:00.000Z",
    "totalSpent": 207.87
  }
}
```

---

## 📊 Dashboard Endpoints

### Get Dashboard Statistics

**GET** `/dashboard/stats`

Get summary statistics for the dashboard.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalSubscriptions": 12,
    "activeSubscriptions": 10,
    "pausedSubscriptions": 1,
    "cancelledSubscriptions": 1,
    "monthlySpending": 156.88,
    "yearlySpending": 1882.56,
    "upcomingPayments": 3,
    "averageSubscriptionCost": 15.69
  }
}
```

---

### Get Spending Breakdown

**GET** `/dashboard/spending`

Get spending breakdown by category.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `period` (optional): month/year (default: month)

**Response (200):**
```json
{
  "success": true,
  "spending": {
    "period": "month",
    "total": 156.88,
    "byCategory": [
      {
        "category": {
          "id": "507f1f77bcf86cd799439012",
          "name": "Entertainment",
          "icon": "🎬"
        },
        "amount": 45.97,
        "percentage": 29.3,
        "subscriptionCount": 3
      },
      {
        "category": {
          "id": "507f1f77bcf86cd799439013",
          "name": "Software",
          "icon": "💻"
        },
        "amount": 70.91,
        "percentage": 45.2,
        "subscriptionCount": 5
      }
    ]
  }
}
```

---

### Get Upcoming Payments

**GET** `/dashboard/upcoming`

Get list of upcoming payments.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `days` (optional): Number of days ahead (default: 30)

**Response (200):**
```json
{
  "success": true,
  "upcomingPayments": [
    {
      "subscription": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Netflix",
        "price": 15.99
      },
      "nextBillingDate": "2024-11-28T00:00:00.000Z",
      "daysUntil": 3,
      "amount": 15.99
    }
  ],
  "totalAmount": 87.45
}
```

---

## 🏷️ Category Endpoints

### Get All Categories

**GET** `/categories`

Get list of all available categories.

**Response (200):**
```json
{
  "success": true,
  "categories": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Entertainment",
      "icon": "🎬",
      "subscriptionCount": 5
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "Software",
      "icon": "💻",
      "subscriptionCount": 8
    }
  ]
}
```

---

## ⚠️ Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Something went wrong. Please try again."
}
```

---

## 🔒 Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 5 requests per 15 minutes |
| General API | 100 requests per 15 minutes |

---

## 📝 Notes

- All dates are in ISO 8601 format
- All monetary values are in USD unless specified
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Maximum pagination limit is 100 items per page