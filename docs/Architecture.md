# Architecture Overview

> **StudyFlow AI** — System design, data flow, and component responsibilities.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                                                             │
│   frontend/ (Vanilla HTML · Tailwind CSS · Vanilla JS)      │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│   │ router.js │  │ store.js  │  │ http.js   │              │
│   │ SPA Router│  │ App State │  │ API Client│              │
│   └───────────┘  └───────────┘  └─────┬─────┘              │
└─────────────────────────────────────── │ ───────────────────┘
                                         │ HTTP/REST
                                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                            │
│                                                             │
│   backend/ (Node.js · Express.js · ES Modules)              │
│                                                             │
│   ┌─────────┐   ┌────────────┐   ┌────────────┐            │
│   │ Routes  │ → │Controllers │ → │  Services  │            │
│   │/api/v1/* │   │(req/res)   │   │(business   │            │
│   └─────────┘   └────────────┘   │  logic)    │            │
│                                   └─────┬──────┘            │
│   Middleware Stack:                     │                   │
│   Helmet · CORS · RateLimit            │                   │
│   RequestId · Morgan · ErrorHandler    ▼                   │
│                                  ┌──────────┐              │
│                                  │  Models  │              │
│                                  │(Mongoose)│              │
│                                  └─────┬────┘              │
└────────────────────────────────────────│────────────────────┘
                                         │ Mongoose ODM
                                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
│                                                             │
│              MongoDB Atlas (Cloud)                          │
│   ┌──────┐ ┌──────┐ ┌─────────┐ ┌──────┐ ┌────────────┐  │
│   │Users │ │Tasks │ │  Goals  │ │Focus │ │  Planner   │  │
│   └──────┘ └──────┘ └─────────┘ └──────┘ └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### Frontend Layer
| Module | File | Responsibility |
|---|---|---|
| SPA Router | `router.js` | Client-side page navigation without page reload |
| HTTP Client | `src/js/http.js` | Centralized fetch wrapper with auth header injection |
| Store | `src/js/store.js` | Global in-memory app state (user session, preferences) |
| Services | `src/js/services/` | Domain-specific API call abstractions |
| Mocks | `src/js/mocks/` | Local mock data for offline/dev use |
| Components | `components/` | Reusable HTML partials (navbar, sidebar, cards, modals) |

### Backend Layer
| Layer | Directory | Responsibility |
|---|---|---|
| Entry | `src/server.js` | Bootstrap server, connect DB, handle shutdown |
| App | `src/app.js` | Register middleware, mount routers |
| Config | `src/config/` | Environment variables, DB connection factory |
| Constants | `src/constants/` | HTTP status codes, API version string |
| Routes | `src/routes/` | Express routers — map URL paths to controllers |
| Controllers | `src/controllers/` | Parse request, call service, send response |
| Services | `src/services/` | Business logic, DB queries, data transformation |
| Models | `src/models/` | Mongoose schemas and static/instance methods |
| Middleware | `src/middleware/` | Auth guard, rate limiter, error handler, request ID |
| Validators | `src/validators/` | Input sanitization and validation logic |
| Utils | `src/utils/` | `AppError`, `asyncWrapper`, JWT helpers |

---

## Authentication Flow

```
Client                     Backend
  │                           │
  │── POST /api/v1/auth/login ──▶│
  │                           │  1. Validate credentials
  │                           │  2. bcrypt.compare(password, hash)
  │                           │  3. jwt.sign({ userId, role })
  │◀── { token, user } ────────│
  │                           │
  │── GET /api/v1/goals ───────▶│
  │   Authorization: Bearer <token>
  │                           │  4. auth.middleware.js verifies JWT
  │                           │  5. Attaches req.user
  │                           │  6. Controller proceeds
  │◀── { goals: [...] } ───────│
```

---

## Data Models (Mongoose Schemas)

| Model | Key Fields |
|---|---|
| `User` | `name`, `email`, `passwordHash`, `createdAt` |
| `Task` | `userId`, `title`, `priority`, `status`, `dueDate` |
| `Goal` | `userId`, `title`, `milestones[]`, `progress`, `deadline` |
| `FocusSession` | `userId`, `duration`, `distractions`, `startedAt` |
| `Planner` | `userId`, `date`, `timeBlocks[]`, `notes` |

---

## Security Architecture

| Concern | Solution |
|---|---|
| HTTP Headers | `helmet` sets secure defaults |
| Cross-Origin | `cors` with configurable origin whitelist |
| Brute Force | `express-rate-limit` (100 req / 15 min per IP) |
| Auth | `jsonwebtoken` — HS256 signed, short-lived tokens |
| Passwords | `bcryptjs` — cost factor 12 |
| Secrets | `.env` — never committed (covered by `.gitignore`) |
| Request Tracing | `requestId` middleware adds `X-Request-Id` header |

---

## Deployment Targets (Planned)

| Component | Platform |
|---|---|
| Frontend | Vercel / Netlify / GitHub Pages |
| Backend API | Railway / Render / Fly.io |
| Database | MongoDB Atlas (M0 free tier → M10 production) |
