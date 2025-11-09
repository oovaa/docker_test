# Server — Technical Specification

This document describes the server component of `docker_test` (the Bun + Express API).

## Summary

- Runtime: Bun (project uses Bun APIs like `RedisClient`)
- Entry: `server/index.ts`
- Purpose: Provide a small HTTP API to interact with a Redis instance (get/set/delete keys and list keys)

## Environment

- `PPORT` — port Bun listens on (default: `3355`)
- `REDIS_PORT` — port where Redis is reachable on `localhost` (default: `6370`)

Server connects to Redis using:

```js
const client = new RedisClient(`redis://localhost:${REDIS_PORT}`)
```

Make sure Redis is reachable at `localhost:${REDIS_PORT}` when starting the server (examples below use Docker to run Redis).

## Endpoints (HTTP)

All endpoints are root-level (no `/api` prefix) and accept/return JSON.

- GET `/` — health/status
  - Response: `{ stat: 'success' }`

- POST `/getVal` — get a value
  - Request JSON: `{ "key": "some:key" }`
  - Success response: `{ stat: 'success', data: <value|null> }`
  - Errors: 400 if key missing, 500 on server error

- POST `/setVal` — set a key
  - Request JSON: `{ "key": "some:key", "val": "value" }`
  - Success response: `{ status: 'success', data: { key, val } }`
  - Errors: 400 if missing fields, 500 on server error

- GET `/getall` — list keys (uses `client.keys('*')`)
  - Success response: `{ status: 'success', data: ["key1","key2"] }`

- DELETE `/deleteV` — delete a key
  - Request body (JSON): `{ "key": "some:key" }`
  - Success response: `{ status: 'success', message: "Key '...' deleted successfully" }`
  - 404 if key not found (result from Redis `del` is 0)

## Errors and behavior

- The server uses standard 4xx/5xx HTTP codes.
- A global error handler returns `{ stat: 'error', message: 'Something went wrong!' }` for unhandled errors.

## Running (local)

1. Ensure Redis is running and reachable. Quick Docker command:

```bash
docker run --name redis-local -p 6370:6379 -d redis:7
```

2. Start the server (from `server/`):

```bash
cd server
# dev/watch
bun --watch index.ts
# or start (production-ish)
bun start
```

## Docker

- The server currently does not include a Dockerfile in the `server/` folder in this repo snapshot. If you containerize the server, ensure:
  - environment variables `PPORT` and `REDIS_PORT` are set appropriately
  - the container can reach the Redis service (networking / compose service)

## Notes and implementation details

- `server/index.ts` is written in TypeScript and uses Bun's `RedisClient` API.
- The server serves static frontend files at `/app`. It prefers `../app/dist` (the production build) if present; otherwise it serves `../app` for quick development previews.
- If you change API paths, update the frontend dev proxy (`app/vite.config.js`) and any documentation accordingly.
