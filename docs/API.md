# API Reference

> **StudyFlow AI** — REST API documentation for `backend/src/routes/`
>
> Base URL: `http://localhost:5000/api/v1`  
> All protected routes require the header: `Authorization: Bearer <JWT_TOKEN>`

---

## Authentication

### `POST /auth/register`
Register a new user account.

**Body**
```json
{
  "name": "Syed Imadulla",
  "email": "user@example.com",
  "password": "securePassword123"
}
```
**Response `201`**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "Syed Imadulla", "email": "user@example.com" }
}
```

---

### `POST /auth/login`
Authenticate and receive a JWT token.

**Body**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
**Response `200`**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "Syed Imadulla" }
}
```

---

### `POST /auth/logout`
🔐 Protected — Invalidate the current session.

**Response `200`**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

## Health

### `GET /health`
Check server status, uptime, and environment. *(Public)*

**Response `200`**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": "12.345s",
  "environment": "development",
  "timestamp": "2025-06-29T12:00:00.000Z"
}
```

---

## Goals

> 🔐 All goal routes are protected.

| Method | Route | Description |
|---|---|---|
| `GET` | `/goals` | List all goals for the authenticated user |
| `POST` | `/goals` | Create a new goal |
| `GET` | `/goals/:id` | Get a single goal by ID |
| `PUT` | `/goals/:id` | Update goal fields |
| `DELETE` | `/goals/:id` | Delete a goal |

### `POST /goals` — Body
```json
{
  "title": "Pass Advanced Algorithms",
  "deadline": "2025-12-15",
  "milestones": ["Week 1: Sorting", "Week 2: Graphs"]
}
```

---

## Tasks

> 🔐 All task routes are protected.

| Method | Route | Description |
|---|---|---|
| `GET` | `/tasks` | List all tasks (supports `?status=`, `?priority=`) |
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks/:id` | Get a task by ID |
| `PUT` | `/tasks/:id` | Update a task |
| `PATCH` | `/tasks/:id/complete` | Mark task as completed |
| `DELETE` | `/tasks/:id` | Delete a task |

### `POST /tasks` — Body
```json
{
  "title": "Review Chapter 5",
  "priority": "high",
  "dueDate": "2025-07-01",
  "goalId": "<goal_id>"
}
```

**Priority values:** `low` · `medium` · `high` · `urgent`

---

## Planner

> 🔐 All planner routes are protected.

| Method | Route | Description |
|---|---|---|
| `GET` | `/planner` | Get today's planner (default) |
| `GET` | `/planner?date=YYYY-MM-DD` | Get planner for a specific date |
| `POST` | `/planner` | Create a planner entry |
| `PUT` | `/planner/:id` | Update a planner entry |
| `DELETE` | `/planner/:id` | Delete a planner entry |

### `POST /planner` — Body
```json
{
  "date": "2025-07-01",
  "timeBlocks": [
    { "startTime": "09:00", "endTime": "10:30", "activity": "Study Algorithms" },
    { "startTime": "11:00", "endTime": "12:00", "activity": "Review notes" }
  ],
  "notes": "Peak focus morning block"
}
```

---

## Focus Sessions

> 🔐 All focus routes are protected.

| Method | Route | Description |
|---|---|---|
| `GET` | `/focus` | List all focus sessions |
| `POST` | `/focus/start` | Start a new focus session |
| `PATCH` | `/focus/:id/end` | End an active session |
| `GET` | `/focus/:id` | Get session details |
| `DELETE` | `/focus/:id` | Delete a session |

### `POST /focus/start` — Body
```json
{
  "duration": 25,
  "taskId": "<optional_task_id>"
}
```

### `PATCH /focus/:id/end` — Body
```json
{
  "distractions": 2,
  "notes": "Good session, minimal interruptions"
}
```

---

## Analytics

> 🔐 All analytics routes are protected.

| Method | Route | Description |
|---|---|---|
| `GET` | `/analytics` | Full analytics summary for the user |
| `GET` | `/analytics/focus` | Focus session statistics (total hours, streak) |
| `GET` | `/analytics/tasks` | Task completion rate over time |
| `GET` | `/analytics/goals` | Goal progress breakdown |

### `GET /analytics` — Response `200`
```json
{
  "totalFocusHours": 42.5,
  "tasksCompleted": 78,
  "goalsActive": 3,
  "currentStreak": 7,
  "weeklyProductivity": [4, 6, 3, 7, 5, 2, 6]
}
```

---

## Error Responses

All error responses follow a consistent shape:

```json
{
  "success": false,
  "error": {
    "code": 401,
    "message": "Authentication token is invalid or expired."
  }
}
```

| Status Code | Meaning |
|---|---|
| `400` | Bad Request — invalid input |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient permissions |
| `404` | Not Found — resource does not exist |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error |

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP address
- **Header on limit:** `Retry-After: <seconds>`
- **Response `429`:**
  ```json
  { "success": false, "error": { "code": 429, "message": "Too many requests, please try again later." } }
  ```
