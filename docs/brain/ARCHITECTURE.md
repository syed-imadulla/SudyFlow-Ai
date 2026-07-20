# Architecture

## High-Level Flow
Data and responsibility flow sequentially downward through the modules:
**Goals** ↓ **Milestones** ↓ **Planner** ↓ **Focus** ↓ **Analytics**

1. Users create **Goals**.
2. Goals are broken into **Milestones**.
3. Milestones are scheduled into the **Planner** as Planner Blocks.
4. Scheduled blocks are executed in the **Focus** module.
5. Execution data feeds into **Analytics**.

## Store Architecture
The frontend uses a custom global state manager `window.SF_STORE`.
- It acts as the single source of truth for UI state and cached entities (goals, planner blocks).
- State mutations are centralized to ensure reactivity and consistency across disjointed views.

## Rendering Flow
- Rendering is store-driven. Views react to changes in the global store.
- Re-rendering is modular (e.g., Weekly view updates independently of Monthly view).
- Data formatting and entity derivation happens immediately before the render loop, utilizing unified helpers (like `getPlannerBlockDate`) to ensure consistency across views.

## Backend Architecture
- Node.js/Express REST API.
- MongoDB for persistence, interfaced via Mongoose.
- Schemas strictly mirror frontend expectations, with Mongoose transforms handling property normalization (e.g., formatting `_id` to `id`, ensuring `dateStr` existence).
