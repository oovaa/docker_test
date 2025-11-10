#!/bin/bash
# Docker Configuration Validation Script
# This script validates the Docker configuration without actually building/running containers

set -e

echo "========================================="
echo "Docker Configuration Validation"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Check 1: Verify Ubuntu base image in server Dockerfile
echo "1. Checking server Dockerfile..."
if grep -q "FROM ubuntu:22.04" server/dockerfile; then
    success "Server uses Ubuntu 22.04 base image"
else
    error "Server does not use Ubuntu 22.04 base image"
    exit 1
fi

# Check 2: Verify Ubuntu base image in app Dockerfile
echo "2. Checking app Dockerfile..."
if grep -q "FROM ubuntu:22.04" app/dockerfile; then
    success "App uses Ubuntu 22.04 base image"
else
    error "App does not use Ubuntu 22.04 base image"
    exit 1
fi

# Check 3: Verify Bun installation in server Dockerfile
echo "3. Checking Bun installation in server..."
if grep -q "curl -fsSL https://bun.sh/install" server/dockerfile; then
    success "Server Dockerfile installs Bun"
else
    error "Server Dockerfile does not install Bun"
    exit 1
fi

# Check 4: Verify Bun installation in app Dockerfile
echo "4. Checking Bun installation in app..."
if grep -q "curl -fsSL https://bun.sh/install" app/dockerfile; then
    success "App Dockerfile installs Bun"
else
    error "App Dockerfile does not install Bun"
    exit 1
fi

# Check 5: Verify VITE_HOST in docker-compose
echo "5. Checking VITE_HOST configuration..."
if grep -q "VITE_HOST=http://server:4456" docker-compose.yaml; then
    success "VITE_HOST correctly set to use service name"
else
    error "VITE_HOST not correctly configured"
    exit 1
fi

# Check 6: Verify no hardcoded IP in app Dockerfile
echo "6. Checking for hardcoded IPs in app Dockerfile..."
if grep -q "143.110.226.0" app/dockerfile; then
    error "Hardcoded IP still present in app Dockerfile"
    exit 1
else
    success "No hardcoded IP in app Dockerfile"
fi

# Check 7: Verify depends_on for app service
echo "7. Checking service dependencies..."
if grep -A 10 "app:" docker-compose.yaml | grep -q "depends_on:"; then
    success "App service has depends_on configuration"
else
    error "App service missing depends_on configuration"
    exit 1
fi

# Check 8: Verify server listens on 0.0.0.0
echo "8. Checking server bind address..."
if grep -q "app.listen(port, '0.0.0.0'" server/index.ts; then
    success "Server listens on 0.0.0.0"
else
    error "Server not configured to listen on 0.0.0.0"
    exit 1
fi

# Check 9: Verify app preview binds to 0.0.0.0
echo "9. Checking app preview bind address..."
if grep -q '"--host", "0.0.0.0"' app/dockerfile; then
    success "App preview binds to 0.0.0.0"
else
    error "App preview not configured to bind to 0.0.0.0"
    exit 1
fi

# Check 10: Verify Redis configuration
echo "10. Checking Redis configuration..."
if grep -q "REDIS_HOST=my_redis_cache" docker-compose.yaml; then
    success "Server configured to connect to Redis via service name"
else
    error "Redis host configuration incorrect"
    exit 1
fi

# Check 11: Verify port exposures
echo "11. Checking port configurations..."
if grep -q '"6655:5173"' docker-compose.yaml && \
   grep -q '"4456:4456"' docker-compose.yaml && \
   grep -q '"6370:6379"' docker-compose.yaml; then
    success "All ports correctly mapped"
else
    error "Port mappings incorrect"
    exit 1
fi

# Check 12: Verify documentation exists
echo "12. Checking documentation..."
if [ -f "DOCKER_SETUP.md" ] && [ -f "IMPLEMENTATION_SUMMARY.md" ]; then
    success "Documentation files present"
else
    error "Missing documentation files"
    exit 1
fi

# Check 13: Verify README updates
echo "13. Checking README updates..."
if grep -q "Docker Compose Setup" README.md && \
   grep -q "Ubuntu 22.04" README.md; then
    success "Main README updated with Docker info"
else
    error "Main README not properly updated"
    exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}All validation checks passed!${NC}"
echo "========================================="
echo ""
echo "Summary of configuration:"
echo "- Base Image: Ubuntu 22.04 (both server and app)"
echo "- Runtime: Bun (installed via official script)"
echo "- App → Server: http://server:4456 (Docker service name)"
echo "- Server → Redis: redis://my_redis_cache:6379 (Docker container name)"
echo "- Host ports: 6655 (app), 4456 (server), 6370 (redis)"
echo ""
echo "To run the stack:"
echo "  docker compose up --build"
echo ""
echo "To access:"
echo "  Frontend: http://localhost:6655"
echo "  Server API: http://localhost:4456"
echo ""
