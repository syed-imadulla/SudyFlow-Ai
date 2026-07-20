# Planner Specification

## Planner Block Schema
Planner Blocks adhere to an ISO-8601 schema. Legacy mock data strictly mirrors production expectations.
- Must contain ISO string fields for temporal state (e.g. `startTime`, `endTime`).
- Canonical dates rely on standard property naming conventions evaluated hierarchically.

## Planner Rendering
The Planner operates across three synchronized views:
1. **Daily View**: Renders a vertical timeline for a single day, mapping block offsets based on precise time structures.
2. **Weekly View**: Renders a 7-day grid with overlapping block conflict resolution.
3. **Monthly View**: Renders a standard calendar grid for high-level block presence and drag-and-drop rescheduling.

## Drag & Drop
Drag-and-drop operations span all three views. Rescheduling a block updates the core state in `SF_STORE`, which cascades downward to trigger re-renders. Defensive coding prevents drag operations from crashing against non-element DOM targets (like text nodes).

## Store Synchronization
`window.SF_STORE` governs Planner State. Mutating a block implies sending an API request, awaiting success, mutating the store, and forcing a UI repaint.

## Canonical Helper
All planner date resolution MUST go through:
`window.getPlannerBlockDate(block)`
This ensures all views (Month, Week, Daily) derive block dates using exactly the same logic. It prevents divergent parsing approaches that historically caused intermittent rendering failures.

## Frozen Rules
**CRITICAL**: Planner internals should not be modified unless fixing a verified bug. The architecture is stable and locked.
