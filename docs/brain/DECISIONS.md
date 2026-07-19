# Architecture & Design Decisions

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 1. Vanilla JavaScript over Frameworks
- **Decision**: The frontend is built entirely using Vanilla ES6 JavaScript, without React, Vue, or Angular.
- **Reason**: Enforces strict understanding of DOM manipulation and native web APIs. Zero build tooling required (no Webpack, Vite, or Babel), enabling rapid prototyping. Eliminates dependency bloat, ensuring maximum performance and instant load times.
- **Alternatives Considered**: React (rejected due to excessive boilerplate for this scale).
- **Impact**: Code must be meticulously organized into components and services to avoid spaghetti logic.
- **Date**: June 2025

## 2. In-Memory State Management (`SF_STORE`)
- **Decision**: State is managed via a custom, centralized store (`store.js`) rather than component-level state or a heavy library like Redux.
- **Reason**: Provides a single source of truth for the entire SPA. Allows for optimistic UI updates. Enforces unidirectional data flow: UI dispatches action → Store calls API → Store patches state → Subscribed components re-render.
- **Alternatives Considered**: Redux (too heavy), direct DOM-driven state (unmaintainable).
- **Impact**: All frontend components must read from `SF_STORE` and never mutate the DOM directly bypassing the store.
- **Date**: June 2025

## 3. Client-Side SPA Routing (`router.js`)
- **Decision**: The frontend uses a custom hash/history-based routing engine rather than requesting new HTML files from the server.
- **Reason**: Creates a seamless, app-like experience with zero page reloads. Crucially, allows persistent background music/sounds in the Focus Sanctuary to continue playing while the user navigates.
- **Alternatives Considered**: Multi-page application (MPA) (rejected due to lack of persistence).
- **Impact**: All `<a href>` tags must be intercepted by the router.
- **Date**: June 2025

## 4. Separation of Models and Planner Events
- **Decision**: Planner blocks are stored separately in the `Planner` collection rather than embedded directly into the `Goal` or `Task` documents.
- **Reason**: Allows calendar blocks to recur independently of the underlying goal. Enables the Planner to be a unified timeline of generic study sessions, specific goal milestones, and classes without requiring a monolithic unified schema.
- **Alternatives Considered**: Embedding planner blocks inside `Goal.milestones` (rejected because not all calendar events are milestones).
- **Impact**: Requires the frontend (`plannerService.js`) to cache planner blocks (`allBlocks`) and perform local joins to determine if a workspace milestone is scheduled.
- **Date**: June 2025

## 5. URL Query Parameters for Cross-Module Navigation
- **Decision**: Navigation between features (e.g., Workspace to Planner) relies on URL query parameters (e.g., `?highlightBlock=123`) instead of direct DOM anchor links (`#id`).
- **Reason**: Allows the target page's JavaScript to intercept the parameter, ensure the data is fully loaded and rendered, and then trigger smooth scrolling and pulsing animations. Avoids race conditions where the browser attempts to scroll to an element that the JS store hasn't rendered yet.
- **Alternatives Considered**: `#hash` links (rejected because elements don't exist in the DOM on initial load).
- **Impact**: Router must pass URL parameters to the page's init/bootstrap function.
- **Date**: July 2026

## 6. Service Layer Backend Pattern
- **Decision**: Backend Express controllers are strictly responsible for request parsing and response formatting, delegating all business logic to `services/`.
- **Reason**: Decouples HTTP concerns from database concerns. Makes the business logic easily testable in isolation. Allows multiple controllers or background cron jobs to reuse the same business logic without mocking HTTP request objects.
- **Alternatives Considered**: Fat controllers (rejected due to poor testability and code duplication).
- **Impact**: Controllers must never contain `mongoose` queries directly.
- **Date**: June 2025


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [ARCHITECTURE.md](ARCHITECTURE.md)
**Update Guidelines**: Add an entry here for every major architectural pivot, new technology adopted, or significant schema change.
**Document Version**: 1.1.0
