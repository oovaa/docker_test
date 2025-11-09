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

The `app/dockerfile` included in the repo builds the app using the `oven/bun` image and runs `bun run preview` on port `5173`. Ensure you build the image with the correct Dockerfile path (case-sensitive) and publish the container port when running.

## Notes

- Development: run the backend and then `bun run dev` (or `npm run dev`) in `app/` to use the dev server with proxy.
- Production: build (`npm run build`), then either preview (`npm run preview`) or let the backend serve `app/dist` at `/app`.