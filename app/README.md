# Frontend — Technical Specification

This frontend is a Vite + React application that provides a UI for managing Redis keys via the backend API.

## Project structure

- `index.html` — Vite entry
- `src/main.jsx` — React bootstrap
- `src/App.jsx` — main app, components and API calls
- `src/styles.css` — app styling
- `vite.config.js` — dev server configuration and proxy to backend

## Scripts

- `dev` — `vite` (starts dev server on port 3000)
- `build` — `vite build` (produces `dist/`)
- `preview` — `vite preview` (serve the built output)

## API integration

The frontend calls backend endpoints which are expected to be available on the same origin in production or proxied during development. The app expects these endpoints:

- `GET /getall` — returns `{ status: 'success', data: [keys...] }`
- `POST /getVal` — request `{ key }`, returns `{ stat: 'success', data: value }`
- `POST /setVal` — request `{ key, val }`, returns `{ status: 'success', data: { key, val } }`
- `DELETE /deleteV` — request `{ key }`, returns success message or 404

Vite dev server proxies these paths to the backend (see `vite.config.js`). For production, the server serves the built files from `app/dist` at `/app` and the API remains at its root paths.

## Dev details and components

- `App.jsx` contains the main UI:
  - Key set form (key + value)
  - Key get form and result display
  - Key delete form and result display
  - All keys list with inline Get/Delete actions

## Docker

The `app/dockerfile` uses Ubuntu 22.04 as the base image with Bun installed to build and serve the app. 

When running with Docker Compose:
- The app is built with `VITE_HOST` set to `http://server:4456` (the internal Docker service name)
- The preview server runs on port `5173` inside the container, exposed as `6655` on the host
- The app container can communicate with the server container using Docker's internal networking

To run with Docker Compose:

```bash
docker-compose up --build
```

Access the app at `http://localhost:6655` from your browser. The app will communicate with the server API at `http://server:4456` (internal Docker network).

## Notes

- Development: run the backend and then `bun run dev` (or `npm run dev`) in `app/` to use the dev server with proxy.
- Production: build (`npm run build`), then either preview (`npm run preview`) or let the backend serve `app/dist` at `/app`.