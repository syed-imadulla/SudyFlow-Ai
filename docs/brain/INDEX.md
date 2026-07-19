# Project Brain Index

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [README.md](README.md), [AI_BOOTSTRAP.md](AI_BOOTSTRAP.md)

---

## Overview
- **[README.md](README.md)**: Entry point for the Project Brain. Read this first to understand the purpose of the documentation directory.
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)**: High-level vision, tech stack, and architecture. Read to understand what StudyFlow AI is.
- **[CURRENT_STATUS.md](CURRENT_STATUS.md)**: What is actively being worked on, known blockers, and the latest branch/commit information. Read before starting any new work.
- **[CHANGELOG.md](CHANGELOG.md)**: History of completed milestones and releases.
- **[DECISIONS.md](DECISIONS.md)**: Log of major architectural decisions and their rationales. Read to understand *why* things are built a certain way.

## Architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: The client/server split, rendering pipelines, and layer responsibilities.
- **[ROUTING.md](ROUTING.md)**: SPA navigation and URL parameter mapping.
- **[STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)**: How `SF_STORE` manages frontend state. Read before modifying any UI state.
- **[DATA_FLOW.md](DATA_FLOW.md)**: Step-by-step lifecycle of core interactions (from UI click to Database write).

## Backend
- **[DATABASE.md](DATABASE.md)**: Mongoose schemas, indexes, and relationships. Read when designing new features or modifying data structures.
- **[API_REFERENCE.md](API_REFERENCE.md)**: Complete inventory of REST endpoints. Read when integrating frontend components with the backend.
- **[AUTHENTICATION.md](AUTHENTICATION.md)**: JWT auth, security, and protected routes.

## Features
- **[FEATURES.md](FEATURES.md)**: Inventory of all features and their business value.
- **[WORKSPACE.md](WORKSPACE.md)**: Deep dive into the Workspace. Read before modifying the goal/task management UI.
- **[PLANNER.md](PLANNER.md)**: Deep dive into the Smart Planner and calendar block scheduling.
- **[IDEALAB.md](IDEALAB.md)**: Deep dive into the AI IdeaLab workflow.

## Development
- **[DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)**: The mandatory ruleset. Read before writing any code. Contains the Definition of Done.
- **[AI_WORKFLOW.md](AI_WORKFLOW.md)**: Instructions specific to AI agents and LLMs.
- **[AI_BOOTSTRAP.md](AI_BOOTSTRAP.md)**: A quickstart guide for any new AI assistant to get up to speed in 5 minutes.
- **[CONVENTIONS.md](CONVENTIONS.md)**: Coding, naming, and stylistic conventions.
- **[TESTING.md](TESTING.md)**: QA, regression testing, and verification procedures.
- **[DEPENDENCIES.md](DEPENDENCIES.md)**: Critical files and package dependencies.
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Environment variables and deployment strategies.
- **[KNOWN_BUGS.md](KNOWN_BUGS.md)**: Active issues and technical debt.

## Document Ownership Matrix
Use this matrix to understand when to update specific documents.

- **[README.md](README.md) & [INDEX.md](INDEX.md)**: Update when new documents are added to the Project Brain.
- **[CURRENT_STATUS.md](CURRENT_STATUS.md)**: Update when a milestone is completed, branches change, or priorities shift.
- **[CHANGELOG.md](CHANGELOG.md)**: Update for every release or completed milestone.
- **[DECISIONS.md](DECISIONS.md)**: Update when a new architectural pattern or dependency is adopted.
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Update when the client/server split or rendering pipeline changes.
- **[DATA_FLOW.md](DATA_FLOW.md)**: Update when a core interaction lifecycle changes.
- **[STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)**: Update when `SF_STORE` slices or mutation logic changes.
- **[DATABASE.md](DATABASE.md)**: Update when MongoDB schemas, indexes, or relationships change.
- **[API_REFERENCE.md](API_REFERENCE.md)**: Update when new REST endpoints are added or modified.
- **[WORKSPACE.md](WORKSPACE.md)**: Update when the Workspace UI, rendering, or goal scheduling changes.
- **[PLANNER.md](PLANNER.md)**: Update when calendar block logic, recurring events, or Planner UI changes.
- **[IDEALAB.md](IDEALAB.md)**: Update when AI generation prompts or endpoints change.
- **[DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)**: Update when the Definition of Done or workflow rules change.
- **[DEPENDENCIES.md](DEPENDENCIES.md)**: Update when new NPM packages or CDNs are introduced.



## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [README.md](README.md), [AI_BOOTSTRAP.md](AI_BOOTSTRAP.md)
**Update Guidelines**: Add any new documentation files to this index immediately upon creation.
**Document Version**: 1.0.0
