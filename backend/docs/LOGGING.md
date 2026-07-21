# Logging & Observability

This document outlines the structured logging architecture for the StudyFlow AI backend. 
We have replaced generic `console` statements with a centralized, production-grade structured logger using **Pino**.

## Logger Configuration
- **Library**: Pino (`pino` and `pino-http`)
- **Location**: `src/utils/logger.js`
- **Environments**:
  - **Development**: Pretty-printed output, colorized, readable timestamps, stack traces included.
  - **Production**: Compact JSON, ISO timestamps, no coloring, optimized for ingestion by monitoring systems (e.g. ELK, Datadog).

## Log Levels

Use consistent log levels across the application:

1. `logger.debug()`:
   - Development diagnostics.
   - Example: Logging incoming query parameters on a specific route.
2. `logger.info()`:
   - Application lifecycle events (Server startup, DB connection).
   - Significant business events (Authentication success).
3. `logger.warn()`:
   - Recoverable issues or validation warnings.
   - Unexpected client behavior (e.g. rate limit exceeded).
4. `logger.error()`:
   - Application errors, database failures.
   - Rollback failures.
   - Unhandled exceptions.

## HTTP Request Logging

The Express app uses `pino-http` to log incoming requests and outgoing responses. 

Every request log includes:
- Request ID (`reqId`)
- User ID (`userId`, if authenticated)
- HTTP Method & URL
- Status Code
- Response Time
- Client IP (`clientIp`)

## Security & Sanitization

Logs **must never** contain sensitive information. 
The `pino-http` configuration in `src/app.js` is customized with a serializer that ensures the following are stripped before logging:
- Passwords
- Authorization headers (`req.headers['authorization']`)
- Cookies (`req.headers['cookie']` which may contain JWTs)
- Secrets and tokens

## Error Logging

All errors pass through the global `errorHandler`. 
- **Development**: Logs full stack traces and context so developers can debug quickly.
- **Production**: Logs the error internally, but the HTTP response to the client is a sanitized JSON object to avoid exposing system internals.
