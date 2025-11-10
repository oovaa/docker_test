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

The server includes a Dockerfile using Ubuntu 22.04 as the base image with Bun installed. When running in Docker Compose:
- Set `PPORT` to the port the server should listen on (default: `4456`)
- Set `REDIS_HOST` to the Redis service name (e.g., `my_redis_cache` when using docker-compose)
- Set `REDIS_PORT` to the internal Redis port (default: `6379`)

The server listens on `0.0.0.0` to accept connections from other Docker containers and the host.

To run with Docker Compose:

```bash
docker-compose up --build
```

The server will be accessible at `http://localhost:4456` from your host machine, and at `http://server:4456` from other containers in the same Docker network.

## Notes and implementation details

- `server/index.ts` is written in TypeScript and uses Bun's `RedisClient` API.
- The server serves static frontend files at `/app`. It prefers `../app/dist` (the production build) if present; otherwise it serves `../app` for quick development previews.
- If you change API paths, update the frontend dev proxy (`app/vite.config.js`) and any documentation accordingly.
