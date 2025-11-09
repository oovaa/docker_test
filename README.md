# docker_test — Redis Key Manager

This repository contains a small backend (Bun + Express) that exposes a few Redis operations, and a React + Vite frontend that consumes the API.

Quick overview

- Backend: `server/` — Bun + TypeScript, provides endpoints to list keys, get/set values and delete keys in Redis.
- Frontend: `app/` — Vite + React application that provides a friendly UI for the backend.

Quickstart (local)

1. Start Redis (example using Docker):

```bash
docker run --name redis-local -p 6370:6379 -d redis:7
```

2. Start backend:

```bash
cd server
# dev mode
bun --watch index.ts
# or start normally
bun start
```

3a. (Dev frontend) Start the frontend dev server (proxies API to backend):

```bash
cd app
bun install
bun run dev
# open http://localhost:3000
```

3b. (Production preview) Build frontend and let backend serve it at `/app`:

```bash
cd app
bun run build

cd ../server
bun start
# open http://localhost:3355/app
```

Project layout

- `/server` — backend source, `index.ts` entry, `package.json` for Bun scripts.
- `/app` — frontend, Vite + React. Build output is `app/dist`.

Notes

- The backend prefers serving `app/dist` at `/app` when available; otherwise it serves the raw `app/` folder (convenient for quick previews).
- The dev flow uses Vite proxy to avoid CORS in development. Production expects API and frontend to be served by the same origin (backend serves the static build under `/app`).

If you'd like, I can add `docker-compose.yaml` to run backend + redis + frontend preview, or create Makefile targets to simplify starting the stack.
