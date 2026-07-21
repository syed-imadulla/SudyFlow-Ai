# API Errors Registry

This document lists all the standardized machine-readable application error codes returned by the StudyFlow AI backend API.

All errors from the API follow this JSON structure:
```json
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Human-readable description of the error."
  }
}
```

Optional `metadata` may also be present inside the `error` object when more context is available.

## Error Codes

### General & System
- `ERR_NOT_FOUND` (404 Not Found): The requested resource or route does not exist.
- `ERR_VALIDATION` (400 Bad Request): The request payload failed schema or business validation.
- `ERR_CONFLICT` (409 Conflict): The request conflicts with current server state (e.g. unique constraint violation).
- `ERR_BAD_REQUEST` (400 Bad Request): The request was invalid or malformed.
- `ERR_INTERNAL_SERVER` (500 Internal Server Error): An unexpected server error occurred. Used to obscure stack traces in production.

### Auth & Permissions
- `ERR_UNAUTHORIZED` (401 Unauthorized): The user is not authenticated or the token is invalid/expired.
- `ERR_FORBIDDEN` (403 Forbidden): The user lacks permission to access or modify this resource.

### Goal & Milestone
- `ERR_GOAL_NOT_FOUND` (404 Not Found): The specified Goal ID was not found or does not belong to the user.
- `ERR_MILESTONE_NOT_FOUND` (404 Not Found): The specified Milestone ID was not found within the given Goal.
- `ERR_INVALID_TRANSITION` (400 Bad Request): The attempted status transition for a milestone or goal is invalid (e.g. completing a TODO milestone).
- `ERR_ALREADY_COMPLETED` (400 Bad Request): Attempted to schedule or modify a milestone that is already completed.
- `ERR_ALREADY_SCHEDULED` (400 Bad Request): Attempted to schedule a milestone that is already scheduled.

### Planner
- `ERR_PLANNER_NOT_FOUND` (404 Not Found): The specified Planner Event ID was not found or does not belong to the user.
- `ERR_INVALID_RECURRENCE` (400 Bad Request): The provided recurrence pattern for the planner event is invalid.

### Task & Focus
- `ERR_TASK_NOT_FOUND` (404 Not Found): The specified Task ID was not found or does not belong to the user.
- `ERR_FOCUS_SESSION_NOT_FOUND` (404 Not Found): The specified Focus Session ID was not found or does not belong to the user.
