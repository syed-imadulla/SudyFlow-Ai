# AI Workflow

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md), [TESTING.md](TESTING.md)

---

## 1. The Mandatory AI Workflow
If you are an AI assistant, you MUST execute the following sequence for every major task. Do not skip steps.

```text
Receive Task from User
       ↓
Read docs/brain/README.md
       ↓
Read docs/brain/PROJECT_OVERVIEW.md
       ↓
Read docs/brain/CURRENT_STATUS.md
       ↓
Read docs/brain/DEVELOPMENT_RULES.md
       ↓
Read docs/brain/DECISIONS.md
       ↓
Read the specific Feature Document (e.g. WORKSPACE.md)
       ↓
Analyze the relevant codebase files using view_file or list_dir
       ↓
Produce an Implementation Plan (Artifact)
       ↓
STOP. Wait for explicit user approval.
       ↓
Implement Code Changes
       ↓
Run Tests / Manual Verification
       ↓
Update relevant Project Brain documentation
       ↓
Update CHANGELOG.md
       ↓
Commit (if requested)
       ↓
Done
```

## 2. What AI Must NEVER Do
- **NEVER** rewrite entire files if you only need to change a few lines. Use precise multi-line replacement tools (`multi_replace_file_content`).
- **NEVER** introduce new NPM dependencies or frontend libraries (like React/Tailwind scripts) without explicit user consent.
- **NEVER** guess database relationships. Always read the Mongoose models in `backend/src/models`.
- **NEVER** leave `console.log()` statements from debugging in production code. Clean up after yourself.
- **NEVER** assume a variable is globally available on `window` unless verified in `router.js` or `store.js`.
- **NEVER** bypass `SF_STORE.dispatch` to manipulate the DOM directly.

## 3. Communication Rules
- Do not repeat long code blocks in your chat responses unless necessary for explanation. Use Artifacts or direct file edits.
- If you are stuck or if the architecture contradicts the user's request, STOP and ask the user for clarification. Do not force an anti-pattern.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md), [TESTING.md](TESTING.md)
**Update Guidelines**: Update if the AI tooling (e.g. Antigravity IDE constraints) changes.
**Document Version**: 1.0.0
