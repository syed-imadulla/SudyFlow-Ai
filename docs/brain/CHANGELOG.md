# Changelog

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.3
**Related Documents**: [CURRENT_STATUS.md](CURRENT_STATUS.md)

---

## Phase 2 — Planner Upgrades (v1.1.0)
*Status: In Progress (July 2026)*

### Milestone 2.3: Sync Goal Status
- **API Contract Alignment**: Rewrote the Mock API layer to strictly emulate the Backend API JSON schema, removing legacy structures and ensuring the frontend is fully environment-agnostic.
- **Reactive UI Updates**: Upgraded `SF_STORE` to mutate `allBlocks` locally on UPDATE/DELETE, enabling instant re-renders.
- **Dynamic Dashboard Timeline**: Rewrote the "Today's Schedule" widget on the Dashboard to reactively pull in and sort incomplete scheduled milestones.
- **Architecture Refinement**: Extracted scheduling logic into a reusable `plannerService.getUpcomingScheduledMilestones()` helper to decouple presentation (Dashboard) from data transformation.
- **Enhanced Workspace Badges**: Improved the scheduled milestone badges on Task Cards to display relative dates (e.g., Today, Tomorrow) and total durations.

### Milestone 2.2: Planner Block Linking
- **Two-way Navigation**: Implemented dynamic linking between the Workspace and Planner. Users can click "View in Planner" on a scheduled milestone to jump to the exact time block, and click a planner badge to jump back to the Workspace goal.
- **Duplicate Prevention**: Replaced the "Schedule" button with a "Scheduled" badge once a milestone has a corresponding planner block to prevent double-booking.
- **Persistence Fix**: Upgraded `SF_STORE` to cache `allBlocks` on load, allowing the Workspace to instantly recognize scheduled milestones regardless of what timeline view the Planner is currently rendering.

### Milestone 2.1: Planner Foundation & UI Polish
- **UI Consistency**: Redesigned the scheduling modal to match the dark, minimalist aesthetic of the StudyFlow design system.
- **Bug Fixes**: Resolved critical `ObjectId` casting failures on the backend and fixed undefined `createBlock` errors in the frontend service injection.

## Phase 1 — Foundation (v1.0.0)
*Status: Complete (June 2025)*

### Milestone 1.0: Core Platform Release
- **Full-Stack Scaffolding**: Established the Node.js Express backend and Vanilla JS frontend architecture.
- **Authentication**: Built robust JWT-based login/register flows with password hashing and security middleware (Helmet, CORS, rate-limiting).
- **Database Schema**: Created core Mongoose models: `User`, `Task`, `Goal`, `FocusSession`, and `Planner`.
- **Custom SPA Framework**: Built `router.js` for zero-reload client navigation and `store.js` for centralized state management.
- **Initial Views**: Drafted the IdeaLab, Smart Planner, Focus Sanctuary, Analytics, and Dashboard screens.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [CURRENT_STATUS.md](CURRENT_STATUS.md)
**Update Guidelines**: Add new sections here whenever a milestone or phase is officially marked complete.
**Document Version**: 1.0.0
