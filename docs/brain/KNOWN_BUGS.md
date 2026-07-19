# Known Bugs & Technical Debt

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [TESTING.md](TESTING.md), [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 1. Known Bugs
- **Playwright Environment Failures**: The E2E testing framework fails with segmentation faults when run inside the Antigravity IDE constraints.
- **Orphaned Planner Blocks**: If a Goal or Subtask is deleted, the corresponding Planner Block is not always cascade-deleted, leading to ghost blocks in the calendar. (Needs verification/fix in `goal.controller.js`).

## 2. Technical Debt & Architectural Risks
- **Tailwind CDN**: The frontend relies on the Tailwind CSS CDN script, which evaluates styles in the browser at runtime. This causes a flash of unstyled content (FOUC) and hurts performance. Must be replaced with a PostCSS build step.
- **Manual Script Loading**: Frontend dependencies are managed via HTML `<script>` tags without `defer` or `type="module"` strict enforcement. This makes load order brittle.
- **Lack of Input Sanitization**: Backend routes do not aggressively sanitize HTML/NoSQL injection payloads beyond basic Mongoose type casting. (Recommend adding `DOMPurify` and `mongo-sanitize`).

## 3. High Priority Improvements
1. **Recurring Events (Sprint 3D)**: The database model supports recurring events, but the frontend UI and backend generation logic are missing.
2. **Weekly & Monthly Planner Views**: The routing exists, but the rendering functions are stubs.
3. **IdeaLab AI Integration**: The current IdeaLab uses mocked JSON responses. It needs a real Express controller to communicate with the Gemini/OpenAI API.

## 4. Low Priority Improvements
- **Drag & Drop Reordering**: Implementing native HTML5 drag-and-drop for Workspace subtasks and Planner blocks.
- **Dark Mode Persistence**: Ensure the dark/light mode toggle saves preference to `localStorage`.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [TESTING.md](TESTING.md), [ARCHITECTURE.md](ARCHITECTURE.md)
**Update Guidelines**: Remove bugs when fixed (and add to CHANGELOG). Re-evaluate priorities at the start of each new Milestone.
**Document Version**: 1.0.0
