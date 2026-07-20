# Module Integrations

This document is the authoritative reference for all cross-module communication and data exchange within StudyFlow AI. While `ARCHITECTURE.md` defines the system structure, this document defines the *contracts* between those structures.

## Module Flow
The overarching lifecycle of a user's intent within the system moves through these stages sequentially:

```text
Goal
 │
 ▼
Milestone
 │
 ▼
Planner Block
 │
 ▼
Focus Session
 │
 ▼
Goal Progress
 │
 ▼
Analytics
 │
 ▼
AI Coach
```

## Data Ownership
To prevent boundary bleed, data ownership is strictly enforced:

```text
Goal Module       owns   Goals
Milestone Module  owns   Milestones
Planner           owns   Planner Blocks
Focus             owns   Focus Sessions
Analytics         owns   Reports
AI                owns   Recommendations
```

## Integration Principles
1. **Each module owns its own data.**
2. **Modules communicate only through IDs.**
3. **No duplicated business logic.**
4. **No title or text matching.**
5. **No circular dependencies.**
6. **Planner is the scheduling source of truth.** Planner owns scheduling.
7. **Goals are the progress source of truth.** Goal owns milestone lifecycle.
8. **Focus is the execution source of truth.**
9. **Analytics is read-only.**
10. **AI is advisory only.**
11. **Cross-domain operations happen only through application-level orchestration.**
12. **Domains never directly mutate another domain's entities.**
13. **UI coordinates user interaction only.**
14. **Business workflows belong outside presentation components.**

## Cross-Module Contracts

### Goals → Planner
**Purpose**: Transforming intent into actionable, scheduled work.
**Data Flow**: A Milestone is scheduled, generating a Planner Block.
- **Required IDs**: `goalId` and `milestoneId` are mandatory links embedded in the Planner Block.
- **Synchronization Rules**: No title matching is permitted. Relationships are maintained strictly through IDs.
- **Ownership**: Planner owns the scheduling data. Goals own the milestone data.
- **Source of Truth**: Planner blocks are created *only* through scheduling action.

### Planner → Focus
*(Future)*
**Purpose**: Transitioning scheduled time into active execution.
- Planner creates Focus Sessions based on scheduled blocks.
- Focus **never** creates Planner Blocks.
- Planner remains the absolute scheduling source.

### Focus → Goals
*(Future)*
**Purpose**: Translating completed work into overarching progress.
- Completing a Focus Session updates milestone progress via the linked IDs.
- Goal progress is dynamically calculated from completed milestones.
- Focus **never** edits Goal metadata directly.

### Goals → Analytics
*(Future)*
**Purpose**: Deriving insights from user behavior.
- Analytics reads Goals, Milestones, Completions, Planner history, and Focus history.
- Analytics **never** modifies Goals (read-only boundary).

### Analytics → AI
*(Future)*
**Purpose**: Contextualizing guidance based on user performance.
- AI consumes Analytics reports.
- AI **never** directly modifies the Planner or Goals.
- AI only produces recommendations for the user to accept or reject.

## Phase Mapping
Integrations are being introduced progressively according to the project roadmap:

- **Phase 1**: Planner only - ✅ Complete
- **Phase 2**: Goals ↔ Planner - 🟢 Current
- **Phase 3**: Planner → Focus - 🔒 Locked
- **Phase 4**: Focus → Goal Progress - 🔒 Locked
- **Phase 5**: Analytics - 🔒 Locked
- **Phase 6**: AI Coach - 🔒 Locked
