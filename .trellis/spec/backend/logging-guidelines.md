# Logging Guidelines

> How logging is done in this project.

---

## Overview

- **Library**: `pino` (fast, structured JSON logging)
- **Format**: JSON for production, pretty for development

---

## Setup

```typescript
// lib/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

// Create child loggers for modules
export const createLogger = (module: string) => logger.child({ module });
```

---

## Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `error` | Unexpected failures, exceptions | Integration failures, DB errors |
| `warn` | Recoverable issues, degraded state | Retry attempts, fallback used |
| `info` | Important business events | Task created, gate passed, flow transitioned |
| `debug` | Development troubleshooting | Request/response details, query params |

---

## Structured Logging

Always include context fields:

```typescript
const log = createLogger('workflow.service');

// ✅ Good: Structured with context
log.info({ taskId, action: 'create', businessLine }, 'Task created');
log.error({ taskId, gateType, error: err.message }, 'Gate validation failed');

// ❌ Bad: String interpolation
log.info(`Task ${taskId} created for ${businessLine}`);
```

### Required Fields

| Field | Description |
|-------|-------------|
| `module` | Service/component name |
| `taskId` | Task ID (when applicable) |
| `action` | Operation being performed |
| `duration` | Time taken (for performance) |

---

## What to Log

### Must Log (info level)

- Task lifecycle: create, flow, cancel, complete
- Gate validation: start, pass, fail
- Queue operations: enter, process, complete
- Third-party calls: request sent, response received
- Scheduled job: start, complete

```typescript
// Task flow
log.info({ taskId, fromNode, toNode }, 'Task transitioned');

// Gate validation
log.info({ taskId, gateType, result: 'pass', coverage: 85 }, 'Gate passed');
log.warn({ taskId, gateType, result: 'fail', reason }, 'Gate failed');

// Integration
log.info({ system: 'jenkins', jobName, buildNumber }, 'Jenkins job triggered');
log.info({ system: 'jenkins', jobName, duration: 1234 }, 'Jenkins response received');
```

### Should Log (debug level)

- Request/response bodies (sanitized)
- Query parameters
- Cache hits/misses

---

## What NOT to Log

- ❌ Passwords, tokens, API keys
- ❌ Personal information (PII)
- ❌ Full request bodies with sensitive fields
- ❌ Database connection strings

```typescript
// ✅ Good: Sanitize sensitive data
log.debug({
  request: { ...body, password: '[REDACTED]' }
}, 'Login attempt');

// ❌ Bad: Logging credentials
log.debug({ request: body }, 'Login attempt');
```

---

## Integration Logging

Log all third-party calls with timing:

```typescript
// lib/integrations/jenkins.ts
const log = createLogger('integration.jenkins');

export async function triggerJob(jobName: string) {
  const start = Date.now();
  log.info({ jobName }, 'Triggering Jenkins job');

  try {
    const result = await fetch(...);
    log.info({
      jobName,
      duration: Date.now() - start,
      status: result.status
    }, 'Jenkins job triggered');
    return result;
  } catch (error) {
    log.error({
      jobName,
      duration: Date.now() - start,
      error: error.message
    }, 'Jenkins call failed');
    throw error;
  }
}
```

---

## Request Logging

Use middleware for API request logging:

```typescript
// middleware.ts or route wrapper
log.info({
  method: request.method,
  path: request.url,
  userId: session?.user?.id,
}, 'API request');

// After response
log.info({
  method: request.method,
  path: request.url,
  status: response.status,
  duration,
}, 'API response');
```

---

## Forbidden Patterns

- ❌ `console.log` in production code
- ❌ Logging without context (bare strings)
- ❌ Logging sensitive data
- ❌ Excessive debug logging in hot paths
