# StudyFlow AI - Project Brain

## Purpose of the Brain
The Brain is the single source of truth for the StudyFlow AI project. It documents the current architecture, development status, design decisions, roadmap, planner specifications, API contracts, and UI guidelines. Its primary purpose is to provide context for AI assistants and human contributors, reducing the need to re-explain project context and ensuring architectural consistency.

## Brain Maintenance Rules
- Brain is the project's single source of truth.
- Update the Brain after every completed milestone.
- Never duplicate architecture across multiple files.
- Remove obsolete documentation.
- Do not store debugging history.
- Stable decisions belong in `DECISIONS.md`.
- Active work belongs in `SESSION.md`.

## Development Rules
1. **Current Architecture Only**: The Brain must always describe the *current* architecture. Do NOT include old debugging history, obsolete architectures, or failed experiments.
2. **Concise and Readable**: Keep documentation lightweight, professional, and easy to parse.
3. **No Redundancy**: Avoid duplicating information across files where possible. Use references.

## How Contributors Should Update It
- Whenever a milestone finishes, the relevant Brain documents must be updated.
- When architectural decisions are made, they must be recorded in `DECISIONS.md`.
- When new endpoints are added, they must be documented in `API.md`.
- When bugs are actively being investigated, they go into `DEBUG_NOTES.md`. Once resolved, they are removed.

## Development Lifecycle
Architecture
↓
Brain Update
↓
Implementation
↓
Manual Testing
↓
Brain Update
↓
Commit
↓
Push
↓
Next Task

## Brain Update Checklist
Whenever a milestone completes:
- [ ] Update `CURRENT_STATUS.md`
- [ ] Update `SESSION.md`
- [ ] Update `CHANGELOG.md`
- [ ] Update `ROADMAP.md`
- [ ] Update `DECISIONS.md` (if architecture changed)
- [ ] Commit
- [ ] Push

## Git Commit Convention
- `feat(...)`: A new feature
- `fix(...)`: A bug fix
- `refactor(...)`: A code change that neither fixes a bug nor adds a feature
- `docs(...)`: Documentation only changes
- `style(...)`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `test(...)`: Adding missing tests or correcting existing tests

**Examples:**
- `feat(goals): implement goal CRUD`
- `feat(planner): schedule milestone`
- `fix(planner): resolve daily filtering`
- `docs(brain): update roadmap`
- `refactor(store): simplify planner selectors`
