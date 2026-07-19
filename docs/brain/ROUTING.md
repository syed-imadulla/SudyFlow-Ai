# Routing

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [ARCHITECTURE.md](ARCHITECTURE.md), [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)

---

## Client-Side Routing (`SF_ROUTER`)
StudyFlow AI uses a custom client-side router located in `/frontend/router.js`. 

Because there is no framework like Next.js or React Router, `SF_ROUTER` intercepts navigation manually to provide a Single Page Application (SPA) feel, avoiding full page reloads.

### Registration and Navigation
Every major view (e.g., Workspace, Planner) must register its initialization function with the router:
```javascript
window.SF_ROUTER.register('workspace', {
  init: function() {
    // Bootstrap logic, fetch data, render initial view
  }
});
```

To navigate between pages, use:
```javascript
window.SF_ROUTER.navigate('planner', { highlightBlock: '12345' });
```

### URL Query Parameters & Deep Linking
To trigger specific animations or data loading when a user navigates from one page to another (e.g., clicking "View in Planner" from the Workspace), the app uses URL Query Parameters.
- **Example**: `planner.html?highlightBlock=669a8b1...&date=2026-07-15`
- The `init()` function of the target page parses `window.location.search`, ensures the relevant data is loaded via `SF_STORE`, and then triggers DOM actions (like smooth scrolling or pulsing).
- Direct DOM `#id` anchor links are **NOT ALLOWED** because elements are rendered dynamically by JS, leading to race conditions where the browser scrolls before the element exists.

### Protected Routes
`SF_ROUTER` automatically checks `authService.isAuthenticated()` before loading protected pages (Workspace, Planner, Analytics, Focus, IdeaLab, Dashboard). If unauthenticated, the router redirects the user to `login.html`.

## Backend Routing
The backend routing follows a standard Express pattern inside `/backend/src/routes/`.

### Route Modularity
Each major domain has its own router file, injected into `app.js`:
- `/api/auth/*` → `authRoutes.js`
- `/api/goals/*` → `goalsRoutes.js`
- `/api/planner/*` → `plannerRoutes.js`
- `/api/focus/*` → `focusRoutes.js`

### Middleware Pipeline
A standard protected API route looks like this:
```javascript
router.post('/', authenticateJWT, PlannerController.createBlock);
```
1. **Request** hits the route.
2. `authenticateJWT` middleware extracts the token from the header, verifies it, and attaches `req.user`.
3. If valid, the request proceeds to the specific `Controller` method.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [ARCHITECTURE.md](ARCHITECTURE.md), [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)
**Update Guidelines**: Update when the frontend router adds new lifecycle hooks or if a transition is made to the native History API pushState mechanism.
**Document Version**: 1.0.0
