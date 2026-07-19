# Development Rules

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [AI_WORKFLOW.md](AI_WORKFLOW.md), [CONVENTIONS.md](CONVENTIONS.md)

---

## 1. General Development Principles
- **No Magic**: Do not introduce libraries, frameworks, or tools unless explicitly approved. If you can write it in 50 lines of vanilla JS, do not add a 500kb dependency.
- **Single Source of Truth**: If data is represented in multiple places, it must originate from a single source (e.g., `SF_STORE` on the frontend, MongoDB on the backend).

## 2. Architecture Rules
- **Backend**: Strict 3-tier separation. Routes → Controllers → Services. Controllers must never execute Mongoose queries directly.
- **Frontend**: Strict separation of concerns. UI Components render HTML. Services fetch data. Store manages state.

## 3. Store Rules (`SF_STORE`)
- **Immutability**: Never mutate state directly. Always use `SF_STORE.dispatch()`.
- **Read-Only**: Components must treat data returned by `SF_STORE.getSlice()` or `.subscribe()` as read-only.
- **Optimistic Updates**: Services must update the store *before* the API call returns, and roll back if the API call fails.

## 4. Frontend Rules
- **No Direct DOM Manipulation for State**: Use the store's subscribe method to trigger re-renders. Do not manually update text nodes (e.g., `element.innerText = newName`) bypassing the store.
- **Routing**: Use `SF_ROUTER.navigate()`. Do not use direct `<a href="page.html">` tags if they bypass the SPA router.

## 5. Backend Rules
- **Validation**: All incoming request payloads must be validated in the Route layer (using middleware or Joi/Zod if added later) before reaching the Controller.
- **Error Handling**: Use the `AppError` class. Never return raw database error stack traces to the client.

## 6. Planning & Workflow Rules
**Before writing ANY code, every future implementation must follow this checklist:**
- [ ] Read Project Brain
- [ ] Analyze existing implementation
- [ ] Create implementation plan
- [ ] Wait for approval
- [ ] Implement
- [ ] Test
- [ ] Update documentation
- [ ] Update CHANGELOG
- [ ] Commit
- [ ] Push

### Definition of Done
A task is NOT complete until:
- Code is implemented
- Manual testing passes
- Documentation updated
- CHANGELOG updated
- CURRENT_STATUS updated
- No regressions found

## 7. Refactoring & Bug Fix Rules
- **No Scope Creep**: If you are assigned to fix a bug in the Planner, do NOT refactor the Workspace unless the bug originates there.
- **Root Cause Analysis**: Do not apply band-aid fixes (e.g., checking `if (undefined)`). Find out *why* it is undefined and fix the source.


## 8. Feature Development Lifecycle
The official StudyFlow development lifecycle is:
1. Receive Feature Request
2. Read `AI_BOOTSTRAP.md`
3. Read `CURRENT_STATUS.md`
4. Read relevant feature document
5. Analyze existing implementation
6. Create implementation plan
7. Review & Wait for Approval
8. Implement
9. Manual testing & Regression testing
10. Update Project Brain (Documentation)
11. Update CHANGELOG
12. Commit & Push
13. Done

## 9. Project Maintenance Policy
The Project Brain must be maintained actively as part of development. It is a living engineering system.

**When documentation must be updated:**
- New feature added
- Bug fix that changes expected behavior
- Architecture change
- API signature change
- Database schema change
- Store slice added or modified
- Routing change
- Authentication change
- New milestone started or completed
- Major refactor

*Rule*: Documentation updates are strictly part of the Definition of Done. If you implement a feature but do not update the Project Brain, the task is incomplete.

## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [AI_WORKFLOW.md](AI_WORKFLOW.md), [CONVENTIONS.md](CONVENTIONS.md)
**Update Guidelines**: Update whenever a fundamental architectural rule is added or removed.
**Document Version**: 1.0.0
