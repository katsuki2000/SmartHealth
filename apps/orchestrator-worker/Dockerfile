FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# On copie les fichiers de config du monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# On copie le package.json de l'app
COPY apps/orchestrator-worker/package.json ./apps/orchestrator-worker/

# Installation des dépendances
RUN pnpm install --frozen-lockfile

# Copie du code source
COPY apps/orchestrator-worker/ ./apps/orchestrator-worker/

# Build de l'application
WORKDIR /app/apps/orchestrator-worker
RUN pnpm run build

# Stage final pour l'exécution
FROM node:20-slim

WORKDIR /app

# On copie le nécessaire
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/orchestrator-worker/node_modules ./apps/orchestrator-worker/node_modules
COPY --from=base /app/apps/orchestrator-worker/lib ./apps/orchestrator-worker/lib
COPY --from=base /app/apps/orchestrator-worker/package.json ./apps/orchestrator-worker/

# Le worker n'expose pas de port (il se connecte à Temporal)
CMD ["node", "apps/orchestrator-worker/lib/worker.js"]
