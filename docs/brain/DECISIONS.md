# Architectural Decisions

This document records the most important architectural decisions.

1. **Planner is the scheduling source of truth.**
2. **Rendering is store-driven.** Disjointed views do not manage their own underlying block data.
3. **Canonical date helper:** `getPlannerBlockDate()` handles all date string extractions from block entities. Do not parse dates manually inline.
4. **Mock schema mirrors backend schema.** There should be no structural difference between test environments and production datasets.
5. **Planner architecture is frozen.** Do not refactor core planner behaviors (drag-and-drop, overlaps, grid systems) unless solving a validated bug.
6. **No duplicate business logic.** If a pattern exists, reuse it. Do not reimplement helpers natively within a component.
