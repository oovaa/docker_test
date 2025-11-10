# docker_test — Redis Key Manager

This repository contains a small backend (Bun + Express) that exposes a few Redis operations, and a React + Vite frontend that consumes the API.

Quick overview

- Backend: `server/` — Bun + TypeScript, provides endpoints to list keys, get/set values and delete keys in Redis.
- Frontend: `app/` — Vite + React application that provides a friendly UI for the backend.

## Docker Compose Setup (Recommended)

The easiest way to run the entire stack (Redis + Backend + Frontend) is using Docker Compose:

```bash
docker compose up --build
```

This will start:
- **Redis** on `localhost:6370`
- **Server API** on `localhost:4456`
- **Frontend App** on `localhost:6655`

The app container communicates with the server container using Docker's internal networking (service name `server`). From your browser, access the frontend at `http://localhost:6655`.

To stop all services:

```bash
docker compose down
```

For detailed Docker setup information, troubleshooting, and testing instructions, see [DOCKER_SETUP.md](DOCKER_SETUP.md).

### Docker Details

- Both `server` and `app` use Ubuntu 22.04 as the base image with Bun installed
- The app container is configured to call the server API via `http://server:4456` (internal Docker network)
- All services are properly networked and can communicate with each other

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
- `docker-compose.yaml` — orchestrates Redis, backend, and frontend containers.

Notes

- The backend prefers serving `app/dist` at `/app` when available; otherwise it serves the raw `app/` folder (convenient for quick previews).
- The dev flow uses Vite proxy to avoid CORS in development. Production expects API and frontend to be served by the same origin (backend serves the static build under `/app`).
- When running with Docker Compose, the app container communicates with the server container using Docker's internal service names (e.g., `http://server:4456`).
