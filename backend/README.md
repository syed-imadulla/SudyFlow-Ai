# StudyFlow AI – Backend Foundation

This directory houses the scalable Node.js & Express REST API server architecture for StudyFlow AI.

## Tech Stack
- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **Architecture**: ES Modules (`"type": "module"`), Layered MVC/Service Architecture

## Folder Structure
```
backend/
├── src/
│   ├── config/        # Centralized environment loader & database configuration
│   ├── constants/     # API constants, HTTP status codes, versioning
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Security, request ID, rate limiting, error handlers
│   ├── models/        # Mongoose data schemas (Domain models)
│   ├── routes/        # Modular Express routers mounted at /api/v1
│   ├── services/      # Business logic layer
│   ├── utils/         # Error wrappers, custom error classes
│   ├── app.js         # Express app initialization & security configuration
│   └── server.js      # Server bootstrapper & DB connector
├── .env.example
├── package.json
└── README.md
```

## Getting Started

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and adjust variables as needed:
   ```bash
   cp .env.example .env
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Health Check Endpoint
To verify server operational status and uptime:
```http
GET /api/v1/health
```

**Response**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": "12.345s",
  "environment": "development"
}
```
