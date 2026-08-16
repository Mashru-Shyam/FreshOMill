# Build context is the `frontend/` directory.
#
# Two targets:
#   base - node image with dependencies installed, shared by dev and build (not used directly)
#   dev  - runs the Angular dev server; source is bind-mounted by docker-compose.yml for
#          hot reload, so the COPY here only matters if you build this target standalone
#
# There is no production target yet - production hosting for the built app
# (dist/frontend/browser) hasn't been decided.

FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS dev
COPY . .
EXPOSE 4200
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4200"]
