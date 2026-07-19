# AI Bootstrap Workflow

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [AI_WORKFLOW.md](AI_WORKFLOW.md), [INDEX.md](INDEX.md)

---

## Purpose
This document allows any new AI assistant (Antigravity, Claude, ChatGPT, Gemini, etc.) to securely and accurately understand the StudyFlow AI project in under five minutes.

**If you are an AI assistant starting a new session, follow these steps exactly.**

## The Bootstrap Sequence

- **Step 1:** Read `PROJECT_OVERVIEW.md` to understand the overarching business goal and tech stack.
- **Step 2:** Read `CURRENT_STATUS.md` to understand what is currently broken, what the user wants to build next, and the current commit state.
- **Step 3:** Read `DEVELOPMENT_RULES.md` to internalize the hard technical constraints of the project. Pay specific attention to the Definition of Done.
- **Step 4:** Read `DECISIONS.md` to understand why the architecture is the way it is. Do not suggest rewriting something if `DECISIONS.md` explains why it was built that way.
- **Step 5:** Read the feature-specific document related to your assigned task (e.g., `WORKSPACE.md`, `PLANNER.md`, `API_REFERENCE.md`).
- **Step 6:** Analyze the affected source files using your filesystem tools (e.g., `view_file`).
- **Step 7:** Create an Implementation Plan (usually as an artifact). Detail the exact lines of code you will change.
- **Step 8:** WAIT FOR APPROVAL. **Do not modify source code until the user approves the plan.**
- **Step 9:** Implement the code accurately and precisely.
- **Step 10:** Test or ask the user to manually verify the flow.
- **Step 11:** Update the relevant Project Brain documentation if the architecture or data flow changed.
- **Step 12:** Update `CHANGELOG.md` with your completions.

## What AI Must NEVER Do

- **Never bypass `SF_STORE`:** All state must flow through the centralized store. Do not manually mutate DOM innerHTML for stateful variables.
- **Never duplicate logic:** If a backend service or frontend helper exists, reuse it. Check `API_REFERENCE.md` before writing a new route.
- **Never skip planning:** Do not jump straight to coding. Always present a plan.
- **Never modify completed milestones without approval:** Refactoring old code requires explicit consent.
- **Never remove existing architecture without analysis:** If you see something that looks weird, read `DECISIONS.md` first.
- **Never mark work complete without verification:** Always ensure manual or automated verification passes before declaring success.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [AI_WORKFLOW.md](AI_WORKFLOW.md), [INDEX.md](INDEX.md)
**Update Guidelines**: Keep this document extremely concise. Do not bloat it with technical details. It is only for bootstrapping sessions.
**Document Version**: 1.0.0
