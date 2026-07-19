# Workspace Deep-Dive

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [PLANNER.md](PLANNER.md), [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md), [DATA_FLOW.md](DATA_FLOW.md), [API_REFERENCE.md](API_REFERENCE.md)

---

## 1. Purpose
The Workspace is the primary project management screen of StudyFlow AI. It allows students to manage massive, multi-week assignments ("Goals") by breaking them down into actionable chunks ("Milestones/Subtasks"), which can then be directly scheduled into the Smart Planner.

## 2. Architecture & Rendering Pipeline

The Workspace uses a functional vanilla JS rendering pipeline heavily dependent on `SF_STORE`.

```mermaid
graph TD
    Store[SF_STORE (goals, planner)] -->|Subscribe| RenderPipeline
    RenderPipeline --> renderWorkspaceGoals()
    renderWorkspaceGoals() --> renderGoalCard()
    renderGoalCard() --> renderSubtask()
    renderSubtask() --> plannerService.getBlockForMilestone()
    plannerService.getBlockForMilestone() --> |Found| RenderBadge[Render Scheduled Badge]
    plannerService.getBlockForMilestone() --> |Not Found| RenderBtn[Render Schedule Button]
    RenderBadge --> Inject[Inject into DOM]
    RenderBtn --> Inject
```

### Component Hierarchy
- `workspace.html`: The static HTML shell. Contains `#goalsContainer`.
- `router/workspace.router.js`: Parses URL hashes (`#goals`, `#tasks`) to switch visible tabs.
- `src/js/services/goalsService.js`: Contains API calls.
- Inline Scripts in `workspace.html`: Bind the `renderWorkspaceGoals` function to the `SF_STORE.subscribe('goals')` event.

## 3. Store Integration & Caching Strategy
The Workspace requires data from *two* distinct slices of the store:
1. `goals`: The list of projects and milestones.
2. `planner.allBlocks`: The cache of scheduled calendar events.

To prevent the Workspace from making hundreds of API calls to see if a milestone is scheduled, it relies on the `plannerService` bootstrapping `allBlocks` using `GET /api/planner/events?limit=2000`.

## 4. Scheduling & Navigation
### Duplicate Prevention
A core business rule is: **One Milestone = One Planner Block**.
When `renderSubtask()` executes, it checks `plannerService.getBlockForMilestone(goal.id, subtask.id)`. 
- If a block exists, the UI suppresses the "Schedule" button to prevent double-booking.

### Highlight System & Cross-Page Routing
When a user clicks the "View in Planner" badge on a scheduled milestone, the Workspace triggers:
`window.location.href = 'planner.html?highlightBlock=' + blockId + '&date=' + dateStr;`

The receiving `planner.router.js` intercepts this query parameter, loads the correct date, and applies a CSS animation class to the element ID matching `blockId`.

## 5. Important Functions
- `renderWorkspaceGoals()`: Clears `#goalsContainer` and loops through `SF_STORE.getSlice('goals').items`.
- `window.openScheduleModal(goalId, milestoneId)`: Opens the custom dark-mode modal to select a date/time. Dispatches `planner/CREATE` on submit.
- `window.SF_STORE.dispatch('goals/TOGGLE_SUBTASK', { goalId, subtaskId })`: Triggers a boolean flip for milestone completion, sending a `PATCH` request to the backend.

## 6. Known Limitations
- Subtasks currently do not have rigid dependency ordering (e.g., Subtask 2 cannot be locked until Subtask 1 is complete).
- The `allBlocks` cache fetches up to 2000 events. If a user accumulates more than 2000 blocks over years of usage, older milestones may falsely appear as "Unscheduled".

## 7. Future Improvements
- **AI Breakdown**: Clicking an "Auto-Generate Milestones" button that calls the Gemini API to automatically populate the `subtasks` array based on a syllabus upload.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [PLANNER.md](PLANNER.md), [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md), [DATA_FLOW.md](DATA_FLOW.md), [API_REFERENCE.md](API_REFERENCE.md)
**Update Guidelines**: Update if the rendering paradigm shifts to Web Components or if a drag-and-drop Kanban board is added.
**Document Version**: 1.0.0
