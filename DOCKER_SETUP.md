# Docker Setup Guide

This document explains the Docker configuration for the Redis Key Manager application.

## Architecture

The application consists of three Docker containers:

1. **Redis** - Data storage (Redis 7.2-alpine)
2. **Server** - Backend API (Bun + Express on Ubuntu 22.04)
3. **App** - Frontend UI (React + Vite on Ubuntu 22.04)

## Container Communication

### Inter-Container Communication (Docker Network)

The containers communicate with each other using Docker's internal networking:

- **App → Server**: The app container calls `http://server:4456` (using the service name)
- **Server → Redis**: The server container calls `redis://my_redis_cache:6379` (using the container name)

This is configured in `docker-compose.yaml` via environment variables:
- `VITE_HOST=http://server:4456` (for the app)
- `REDIS_HOST=my_redis_cache` (for the server)

### Host Access

From your host machine (localhost), you can access:

- **Frontend**: `http://localhost:6655` (mapped from container port 5173)
- **Server API**: `http://localhost:4456` (mapped from container port 4456)
- **Redis**: `localhost:6370` (mapped from container port 6379)

## Base Images

Both the server and app containers use **Ubuntu 22.04** as the base image with Bun runtime installed via the official installation script.

### Why Ubuntu?

Ubuntu provides:
- Long-term support (LTS)
- Wide compatibility
- Familiar package management (apt)
- Better debugging tools compared to Alpine

## Running the Application

### Start All Services

```bash
docker compose up --build
```

This command:
1. Builds the server and app images from their Dockerfiles
2. Pulls the Redis image
3. Starts all three containers
4. Sets up the internal Docker network
5. Applies all environment variables

### Stop All Services

```bash
docker compose down
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f server
docker compose logs -f app
docker compose logs -f redis
```

## Testing the Setup

### 1. Check Server Health

From your host machine:

```bash
curl http://localhost:4456
# Expected: {"stat":"success"}
```

### 2. Access the Frontend

Open your browser and navigate to:
```
http://localhost:6655
```

You should see the Redis Key Manager UI.

### 3. Test Inter-Container Communication

The app should be able to communicate with the server automatically. Try:

1. Set a key using the UI
2. Get the key value
3. View all keys
4. Delete a key

All these operations should work, proving that:
- App → Server communication works
- Server → Redis communication works

### 4. Verify Base Images

Check that containers are using Ubuntu:

```bash
# Check server container
docker compose exec server cat /etc/os-release
# Should show Ubuntu 22.04

# Check app container
docker compose exec app cat /etc/os-release
# Should show Ubuntu 22.04
```

## Troubleshooting

### App Cannot Reach Server

If the app cannot communicate with the server:

1. Check that `VITE_HOST` is set correctly in docker-compose.yaml
2. Verify the server is running: `docker compose logs server`
3. Ensure the server is listening on 0.0.0.0 (not just 127.0.0.1)

### Server Cannot Reach Redis

If the server cannot connect to Redis:

1. Check that `REDIS_HOST` is set to `my_redis_cache`
2. Verify Redis is running: `docker compose logs redis`
3. Ensure the `depends_on` configuration is correct

### Port Conflicts

If ports are already in use on your host:

1. Stop conflicting services
2. Or modify the port mappings in docker-compose.yaml:
   ```yaml
   ports:
     - "CUSTOM_HOST_PORT:CONTAINER_PORT"
   ```

## Environment Variables

### Server

- `PPORT` - Port the server listens on (default: 4456)
- `REDIS_HOST` - Redis hostname (set to service name in compose)
- `REDIS_PORT` - Redis port (6379 inside container)

### App

- `VITE_HOST` - Backend API URL (set to `http://server:4456` in compose)

## Network Configuration

Docker Compose automatically creates a default network where:
- Services can communicate using service names as hostnames
- Each service is isolated from the host network
- Specified ports are exposed to the host

The `depends_on` configuration ensures proper startup order:
- Redis starts first
- Server starts after Redis
- App starts after Server

This prevents connection errors during initialization.
