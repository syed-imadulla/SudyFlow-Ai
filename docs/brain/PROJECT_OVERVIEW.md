# Project Overview

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [ARCHITECTURE.md](ARCHITECTURE.md), [CURRENT_STATUS.md](CURRENT_STATUS.md)

---

## Vision & Business Problem
**StudyFlow AI** is an AI-first productivity workspace built specifically for deep student focus. 
The business problem it solves is that traditional productivity tools are often fragmented (requiring separate apps for task management, calendars, timers, and AI chat) and visually cluttered. 
StudyFlow AI helps students break down complex subjects into actionable sprints, track focus time, and measure productivity over time in a unified, zero-distraction dark-mode interface inspired by Linear and Raycast.

## Target Users
Students and lifelong learners who need:
- AI guidance to break large topics into manageable milestones.
- Strict time-blocking and Pomodoro focus tools.
- A zero-distraction, cohesive workflow environment.

## Major Modules
- **Workspace**: Goal and task management with milestone breakdowns.
- **Smart Planner**: Daily timeline blocks with scheduling capabilities.
- **IdeaLab**: AI-guided ideation workflow.
- **Focus Sanctuary**: Full-screen Pomodoro timer.
- **Analytics**: Productivity trends and heatmaps.

## Tech Stack
### Frontend
- **Markup/Styling**: Vanilla HTML5, Tailwind CSS (via CDN), inline SVG icons.
- **Logic**: Vanilla ES6 JavaScript (No React/Vue).
- **Architecture**: Custom Single Page Application (SPA) Router (`router.js`), centralized state store (`store.js`), and component-based UI generation (`components.js`).

### Backend
- **Runtime & Framework**: Node.js 18+ (ES Modules), Express.js 4.x.
- **Database**: MongoDB Atlas via Mongoose 8.x.
- **Authentication**: JWT-based (JSON Web Tokens) with `bcryptjs`.
- **Security**: `helmet`, `cors`, `express-rate-limit`.

## High-Level Architecture
StudyFlow follows a strictly decoupled client-server architecture:
- **Client (Frontend)** operates entirely in the browser using static files. It manages state via an in-memory global store (`SF_STORE`) and navigates pages without reloads using a custom `SF_ROUTER`. It communicates with the backend via a centralized HTTP client (`SF_HTTP`).
- **Server (Backend)** acts exclusively as a JSON REST API. It uses a 3-tier architecture: 
  1. **Routes** map URLs to Controllers.
  2. **Controllers** handle HTTP request/response parsing.
  3. **Services** execute business logic and database queries.

## Repository Overview (Folder Structure)
The monorepo contains two isolated halves:
- `/frontend/` — All static assets, `.html` entry points, and vanilla JavaScript logic.
  - `/frontend/src/js/` — Core architecture (`store.js`, `http.js`, services).
  - `/frontend/router/` — Route controllers.
- `/backend/` — The Node.js Express server.
  - `/backend/src/` — API source code (`controllers/`, `services/`, `models/`, `routes/`).
- `/docs/brain/` — The Project Brain permanent documentation.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [ARCHITECTURE.md](ARCHITECTURE.md), [CURRENT_STATUS.md](CURRENT_STATUS.md)
**Update Guidelines**: Update when the core tech stack, repository structure, or major vision shifts.
**Document Version**: 1.0.0
