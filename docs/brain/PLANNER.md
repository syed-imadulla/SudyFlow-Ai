# Planner Deep-Dive

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.3
**Related Documents**: [FEATURES.md](FEATURES.md), [WORKSPACE.md](WORKSPACE.md), [DATABASE.md](DATABASE.md), [ROUTING.md](ROUTING.md), [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)

---

## 1. Purpose
The Smart Planner is a visual timeline for time-blocking. Unlike traditional to-do lists, the Planner forces students to allocate exact hours (e.g., 14:00 - 15:30) to their Workspace milestones or generic study sessions, eliminating procrastination.

## 2. Architecture & Store Integration
The Planner operates almost entirely through `SF_STORE` and `plannerService.js`.

### The Dual-Cache Strategy
Because calendar apps require fetching massive amounts of data for monthly views, but very specific data for a daily view, the Planner uses two separate caches in `SF_STORE`:
1. `planner.dailyBlocks`: Fetched via `GET /api/planner/daily?date=...`. Used specifically to render the high-fidelity Daily Timeline view.
2. `planner.allBlocks`: Fetched via `GET /api/planner/events?limit=2000`. Used as a global lookup table so other modules (like the Workspace) can instantly check if a milestone is scheduled without needing to know *what date* it was scheduled for.

### Reusable Architecture Helpers
To prevent business logic from leaking into presentation components like the Dashboard or Workspace, `plannerService.js` provides shared utilities:
- `plannerService.getUpcomingScheduledMilestones(limit)`: Retrieves `allBlocks`, filters out completed tasks, cross-references with `goalsSlice` to append milestone metadata (`milestoneTitle`, `goalTitle`), and returns a UI-ready array of scheduled items.

## 3. Rendering Pipeline
```mermaid
graph TD
    SF_STORE -->|Subscribe 'planner'| PlannerHTML
    PlannerHTML -->|Check selectedView| ViewRouter
    ViewRouter -->|'day'| renderDailyView()
    ViewRouter -->|'week'| renderWeeklyView()
    ViewRouter -->|'month'| renderMonthlyCalendar()
    renderDailyView() --> loop[For each block in dailyBlocks]
    loop --> renderBlockUI[Calculate height & absolute positioning]
```

### Daily View (Current Implementation)
The Daily View maps the 24-hour day to a visual grid.
- **Positioning**: The UI calculates the absolute `top` property based on the `startTime` (e.g., 09:30 = 9.5 hours * 60px row height = 570px from top).
- **Height**: The `height` property is calculated based on duration (e.g., 2 hours = 120px).

### Weekly & Monthly Views
*(Currently placeholders. Full implementation scheduled for Milestone 2.3).*

## 4. Workspace Linking & Highlight Animation
The Planner is deeply integrated with the Workspace.
- When `planner.html` loads, `planner.router.js` checks the URL for `?highlightBlock=12345`.
- If present, it waits for `renderDailyView()` to finish injecting HTML.
- It then executes `document.getElementById('blk-12345').scrollIntoView()`.
- A CSS animation (`animate-pulse-purple`) is dynamically added to draw the user's eye to the exact time block they navigated to.

## 5. Planner Lifecycle
1. **Creation**: Triggered via Workspace Schedule Modal or Planner "Add Block" button.
2. **Mutation**: A block can be dragged to a new time. (Updates `startTime` and `endTime` via `PATCH /api/planner/:id`).
3. **Execution**: A block can be clicked to transition into the **Focus Sanctuary**, which passes the `blockId` to the Pomodoro timer.
4. **Completion**: When the Pomodoro finishes, it updates the Planner block status to `completed`.

## 6. Recurring Events (Sprint 3D Architecture)
The backend `Planner.js` model is already scaffolded for advanced recurring events (e.g., "Class every Monday at 9AM").
- **Fields**: `isRecurring`, `seriesId`, `recurrence.frequency`, `recurrence.repeatDays`.
- **Logic**: The API is designed to generate recurring instances dynamically. If a user modifies a single instance of a recurring series (e.g., moving this week's Monday class to Tuesday), it creates an "Exception" block linked via `originalSeriesId` and `exDate`.

## 7. Future Improvements
- **Milestone 2.3**: Activate the Weekly and Monthly rendering functions.
- **Drag & Drop**: Implement native HTML5 Drag and Drop API to allow visually resizing blocks to alter their duration.
- **Conflict Detection**: Backend validation to prevent overlapping blocks unless explicitly permitted.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [WORKSPACE.md](WORKSPACE.md), [DATABASE.md](DATABASE.md), [ROUTING.md](ROUTING.md), [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)
**Update Guidelines**: Update when Weekly/Monthly views are implemented or when Drag-and-Drop is finalized.
**Document Version**: 1.0.0
