# Project Brain Index

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md), [AI_WORKFLOW.md](AI_WORKFLOW.md)

---

Welcome to the **Project Brain**. This documentation directory (`docs/brain/`) is the permanent, single source of truth for the architecture, data flow, features, and status of StudyFlow AI. 

Whether you are a human developer or an AI assistant (Antigravity, ChatGPT, Claude, etc.), **you must use this directory to understand the project before making code changes**. 

## Recommended Reading Order

To quickly understand the project without analyzing the entire codebase, follow this sequence:

### 1. Core Overview
1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) — High-level vision, stack, and architecture.
2. [CURRENT_STATUS.md](CURRENT_STATUS.md) — What is currently being worked on, recent commits, and active blockers.
3. [CHANGELOG.md](CHANGELOG.md) — History of completed milestones.
4. [DECISIONS.md](DECISIONS.md) — Major architectural decisions and their rationales.

### 2. Architecture & Flow
5. [ARCHITECTURE.md](ARCHITECTURE.md) — Client/Server split and layer responsibilities.
6. [DATA_FLOW.md](DATA_FLOW.md) — Step-by-step lifecycle of core interactions.
7. [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) — How `SF_STORE` manages frontend state.
8. [ROUTING.md](ROUTING.md) — URL mapping and SPA navigation.

### 3. Backend & Data
9. [DATABASE.md](DATABASE.md) — Mongoose schemas and relationships.
10. [API_REFERENCE.md](API_REFERENCE.md) — Complete inventory of REST endpoints.
11. [AUTHENTICATION.md](AUTHENTICATION.md) — JWT auth, security, and protected routes.

### 4. Feature Deep-Dives
12. [FEATURES.md](FEATURES.md) — Mapping of all features to their respective files.
13. [WORKSPACE.md](WORKSPACE.md) — Deep dive into the Workspace.
14. [PLANNER.md](PLANNER.md) — Deep dive into the Smart Planner and scheduling.
15. [IDEALAB.md](IDEALAB.md) — Deep dive into the AI IdeaLab workflow.

### 5. Development & Maintenance
16. [AI_WORKFLOW.md](AI_WORKFLOW.md) — Mandatory workflow for AI developer sessions.
17. [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) — Hard rules for modifying this repository.
18. [CONVENTIONS.md](CONVENTIONS.md) — Coding and stylistic conventions.
19. [TESTING.md](TESTING.md) — QA, regression testing, and verification procedures.
20. [DEPENDENCIES.md](DEPENDENCIES.md) — Critical, high-risk files.
21. [DEPLOYMENT.md](DEPLOYMENT.md) — Environment variables and production setup.
22. [KNOWN_BUGS.md](KNOWN_BUGS.md) — Technical debt and active issues.

## How to Use the Project Brain

**For Feature Development**
1. Read `AI_BOOTSTRAP.md`
2. Read `CURRENT_STATUS.md`
3. Read relevant feature document
4. Create implementation plan
5. Wait for approval
6. Implement
7. Test
8. Update documentation

**For Bug Fixes**
1. Read `CURRENT_STATUS.md`
2. Read `KNOWN_BUGS.md`
3. Analyze root cause
4. Create fix plan
5. Implement
6. Regression test
7. Update documentation

## Maintaining the Project Brain

The Project Brain is a living system. It MUST be updated whenever:
- A new feature is added
- The core architecture changes
- A new API endpoint is created
- A Database schema is modified
- State management (`SF_STORE`) is altered
- Authentication logic changes
- A new Milestone is completed
- Significant technical debt is resolved

**Documentation updates are part of the Definition of Done.** If code is pushed but the Project Brain is outdated, the task is considered incomplete.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md), [AI_WORKFLOW.md](AI_WORKFLOW.md)
**Update Guidelines**: Update this file if new documents are added to the Project Brain.
**Document Version**: 1.0.0
