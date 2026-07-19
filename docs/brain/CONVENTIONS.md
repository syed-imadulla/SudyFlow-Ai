# Conventions

**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md), [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 1. Naming Conventions

### Folders and Directories
- Use `kebab-case` for all folder names (e.g., `src`, `js`, `my-feature`).
- **Exceptions**: None.

### Files
- **Backend API Routes**: `[entity].routes.js` (e.g., `planner.routes.js`)
- **Backend Controllers**: `[entity].controller.js` (e.g., `planner.controller.js`)
- **Backend Services**: `[entity].service.js` (e.g., `planner.service.js`)
- **Backend Models**: `PascalCase.js` (e.g., `Planner.js`, `FocusSession.js`)
- **Frontend Services**: `camelCaseService.js` (e.g., `plannerService.js`)
- **Frontend Views**: `[view].html` (e.g., `planner.html`)

### Code Level
- **Variables/Functions**: `camelCase`
- **Classes/Models**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `const MAX_RETRIES = 3`)
- **CSS Classes**: `kebab-case` (Tailwind standard)
- **Store Actions**: `domain/ACTION_NAME` (e.g., `goals/CREATE_WITH_SUBTASKS`)

## 2. Code Style Conventions
- **Quotes**: Use single quotes (`'`) for JS strings. Use double quotes (`"`) for HTML attributes.
- **Indentation**: 2 spaces. No tabs.
- **Semicolons**: Mandatory.
- **Exports (Backend)**: Use ES Modules (`export const`, `import { ... }`). Do not use CommonJS (`require`).

## 3. Commit Message Conventions
StudyFlow AI follows conventional commits:
- `feat:` for new features (e.g., `feat: implement block linking`)
- `fix:` for bug fixes (e.g., `fix: resolve ObjectId cast error`)
- `docs:` for documentation updates (e.g., `docs: generate Project Brain Batch 2`)
- `refactor:` for code structure changes without feature alterations
- `chore:` for maintenance, dependencies, and configuration

## 4. Documentation Conventions
- **Markdown Headers**: Start at H1 (`#`) for the document title, then H2 (`##`) for main sections.
- **Header Block**: Every document in `docs/brain/` MUST start with the standard metadata block (Purpose, Last Updated, Version, Phase, Milestone, Author, Related Documents).
- **Footer Block**: Every document MUST end with the Related Documents, Update Guidelines, and Document Version.


## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |

---
**Related Documents**: [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md), [ARCHITECTURE.md](ARCHITECTURE.md)
**Update Guidelines**: Modify if a linter (like ESLint or Prettier) configuration is added to enforce these programmatically.
**Document Version**: 1.0.0
