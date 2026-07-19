# Sprint Notes

> Development log for **StudyFlow AI** — tracking milestones, decisions, and retrospectives.

---

## Phase 2 — Planner Upgrades (v1.1.0)

**Period:** July 2026
**Status:** ✅ Milestone 2.1 Complete | ✅ Milestone 2.2 Complete
**Branch:** `main`

### Goals
- [x] Milestone 2.1: Planner Foundation & UI Polish
- [x] Milestone 2.2: Planner Block Linking (Two-way Workspace ↔ Planner navigation)
  - [x] Duplicate scheduling prevention
  - [x] Persistence regression fixes (Store synchronization and dynamic linking)
- [ ] Milestone 2.3: Weekly & Monthly Planner Views (Upcoming)

### Architecture Decisions
| Decision | Rationale |
|---|---|
| Planner Store Caching | Used `planner.allBlocks` fetching `/planner/events` to ensure milestones scheduled in the future map cleanly to the workspace UI without backend schema changes. |
| Query Param Navigation | Used `?highlightBlock=` and `SF_ROUTER.navigate` rather than fragile anchor links to achieve scroll-and-pulse animations across view boundaries. |

---

## Sprint 1 — Foundation (v1.0.0)

**Period:** June 2025  
**Status:** ✅ Complete  
**Branch:** `main`  
**Commit:** `b46798e`

### Goals
- [x] Scaffold full-stack monorepo (frontend + backend)
- [x] Implement JWT authentication (register / login / logout)
- [x] Build Mongoose data models: User, Task, Goal, FocusSession, Planner
- [x] Create modular Express REST API with all core routes
- [x] Add production-grade middleware (Helmet, CORS, rate-limit, requestId, Morgan)
- [x] Build vanilla JS SPA frontend with custom router
- [x] Implement IdeaLab, Smart Planner, Focus Sanctuary, Analytics views
- [x] Set up GitHub remote and push complete monorepo
- [x] Add root `.gitignore`, `README.md`, `LICENSE`, and `docs/`

### Architecture Decisions
| Decision | Rationale |
|---|---|
| Vanilla JS frontend (no framework) | Zero build tooling, fast prototyping, easy onboarding |
| ES Modules (`"type": "module"`) | Modern Node.js standards, cleaner imports |
| Service layer pattern | Decouple business logic from controllers for testability |
| MongoDB Atlas | Managed cloud DB, generous free tier, fast setup |
| JWT in Authorization header | Stateless, works for SPA + potential future mobile app |
| Tailwind CSS via CDN | No build step for frontend, rapid utility-first styling |

### Known Issues / Tech Debt
- [ ] Frontend routes are not code-split — all JS loads upfront
- [ ] No input validation on frontend (only backend validators exist)
- [ ] `server.log` should use a rotating log strategy in production
- [ ] No unit or integration tests yet

---

## Sprint 2 — AI Integration (Planned)

**Period:** TBD  
**Status:** 🔲 Not started  
**Target Version:** v1.1.0

### Goals
- [ ] Integrate OpenAI / Gemini API for IdeaLab AI responses
- [ ] AI-generated daily schedule based on user goals
- [ ] Smart task prioritization

---

## Sprint 3 — Testing & Hardening (Planned)

**Period:** TBD  
**Status:** 🔲 Not started  
**Target Version:** v1.2.0

### Goals
- [ ] Add backend unit tests with Jest / Vitest
- [ ] Add API integration tests
- [ ] Set up GitHub Actions CI pipeline
- [ ] Add frontend input validation
- [ ] Implement refresh token rotation

---

## Sprint 4 — Deployment (Planned)

**Period:** TBD  
**Status:** 🔲 Not started  
**Target Version:** v1.3.0

### Goals
- [ ] Deploy frontend to Vercel / Netlify
- [ ] Deploy backend to Railway / Render
- [ ] Configure production environment variables
- [ ] Set up custom domain
- [ ] Add Sentry error monitoring

---

## How to Use This Log

When starting a new sprint, copy this template:

```markdown
## Sprint N — [Name] (vX.Y.Z)

**Period:** [Month Year]
**Status:** 🔲 Not started | 🔄 In progress | ✅ Complete
**Branch:** `feature/...` or `main`

### Goals
- [ ] ...

### Architecture Decisions
| Decision | Rationale |
|---|---|
| ... | ... |

### Retrospective
**What went well:**  
**What to improve:**  
**Blockers:**  
```
