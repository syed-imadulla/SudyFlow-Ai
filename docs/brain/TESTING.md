# Testing & QA Guide

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [KNOWN_BUGS.md](KNOWN_BUGS.md), [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)

---

## 1. Overview
StudyFlow AI currently relies entirely on **Manual Verification**. Due to environment constraints and Playwright segmentation faults experienced in the Antigravity IDE, automated end-to-end (E2E) testing is suspended. Developers and AI assistants MUST perform these manual QA flows.

## 2. Regression Testing Protocols

### Workspace Testing
1. **Load State**: Ensure `#goalsContainer` populates from MongoDB.
2. **Tab Switching**: Verify the URL hash updates when clicking Goals, Tasks, and Timeblocks. Verify the UI switches active tabs smoothly.
3. **Subtask Toggling**: Click a subtask checkbox. Verify the progress bar updates immediately. Refresh the page to verify the state persisted to the backend.

### Planner Testing
1. **Creation**: Open the Schedule Modal from Workspace. Select a future date and time. Click "Schedule".
2. **Rendering**: Ensure the block instantly appears in `planner.html` at the correct vertical position relative to the 24-hour timeline.
3. **Linking Persistence**: Refresh the `workspace.html` page. Verify the "Schedule" button is replaced by the "📅 Scheduled" badge and "View in Planner" link.

### Authentication Testing
1. **Login**: Authenticate as a test user. Verify the `accessToken` appears in `localStorage`.
2. **Protection**: Attempt to navigate to `workspace.html` without a token. Verify redirection to `login.html`.
3. **Logout**: Click Logout. Verify token is wiped and session ends.

## 3. Pre-Release Checklist
Before merging any feature branch or finalizing a Milestone:
- [ ] No `console.log` leftovers in production logic.
- [ ] Cross-browser check (Chrome/Firefox/Safari) for flexbox/grid anomalies.
- [ ] Persistence check: Refreshing the page during a state change must not break the UI.
- [ ] API validation check: Ensure backend correctly rejects malformed payloads (e.g. invalid `ObjectId`).

## 4. Post-Release Checklist
- [ ] Update `CHANGELOG.md` with new features and fixes.
- [ ] Monitor Node.js backend logs for unhandled promise rejections.
- [ ] Update the `Project Brain` documentation to reflect the new architecture.

## 5. Future Automation Strategy (Phase 4)
- **Unit Testing**: Introduce `Jest` for backend service logic (e.g., JWT signing, password hashing, recurrence calculations).
- **E2E Testing**: Re-introduce `Playwright` once environment constraints are resolved, specifically targeting the cross-page navigation flow (Workspace → Planner → Focus).
- **CI/CD**: Add GitHub Actions to run the test suite on every PR to `main`.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [KNOWN_BUGS.md](KNOWN_BUGS.md), [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)
**Update Guidelines**: Update whenever a formal testing framework (Jest/Playwright) is successfully integrated into the project pipeline.
**Document Version**: 1.0.0
