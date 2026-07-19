# Deployment Guide

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [DEPENDENCIES.md](DEPENDENCIES.md), [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 1. Environment Variables
The backend requires a `.env` file at `backend/.env`.

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/studyflow?retryWrites=true&w=majority

# Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Frontend URL (For CORS)
CLIENT_URL=http://localhost:5500
```

## 2. Local Development Setup
1. **Clone**: `git clone <repo>`
2. **Backend Setup**:
   - `cd backend`
   - `npm install`
   - Create `.env` file based on above template.
   - `npm run dev` (Starts server on port 5000 with nodemon).
3. **Frontend Setup**:
   - `cd frontend`
   - Start a local HTTP server (e.g. VS Code Live Server, Python `http.server`, or `npx serve`).
   - Default port should match the backend's `CLIENT_URL` (usually 5500 or 3000).

## 3. Production Setup (Future)
The application is currently in active development (Phase 2) and is not yet deployed to production. The planned architecture is:

### Backend (Render / Heroku)
- Hosted on a Node.js PaaS (e.g., Render, Railway, or Heroku).
- Requires configuring the production MongoDB connection string.
- Must set `NODE_ENV=production` to enable stricter CORS and disable stack traces in API responses.

### Frontend (Vercel / Netlify)
- Hosted on static hosting (e.g., Vercel, Netlify).
- Requires a build step (Vite) to bundle JS files and compile Tailwind CSS for performance.

### Database (MongoDB Atlas)
- Hosted on MongoDB Atlas.
- IP Whitelisting must be configured to allow connections from the backend PaaS.

## 4. Backup & Recovery Strategy
- **Database**: Rely on MongoDB Atlas automated daily backups.
- **Code**: All code is version-controlled via Git/GitHub.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [DEPENDENCIES.md](DEPENDENCIES.md), [ARCHITECTURE.md](ARCHITECTURE.md)
**Update Guidelines**: Overhaul this document entirely when Phase 4 (Deployment & Polish) begins.
**Document Version**: 1.0.0
