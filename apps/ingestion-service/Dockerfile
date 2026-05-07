FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# On copie les fichiers de config du monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# On copie le package.json de l'app et des dépendances partagées si elles existent
COPY apps/ingestion-service/package.json ./apps/ingestion-service/
COPY shared/ ./shared/

# Installation des dépendances
RUN pnpm install --frozen-lockfile

# Copie du code source
COPY apps/ingestion-service/ ./apps/ingestion-service/

# Génération de Prisma
WORKDIR /app/apps/ingestion-service
RUN pnpm exec prisma generate

# Build de l'application
RUN pnpm run build

# Stage final pour l'exécution
FROM node:20-slim

WORKDIR /app
RUN npm install -g pnpm

# On ne copie que le nécessaire pour l'exécution
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/ingestion-service/node_modules ./apps/ingestion-service/node_modules
COPY --from=base /app/apps/ingestion-service/dist ./apps/ingestion-service/dist
COPY --from=base /app/apps/ingestion-service/package.json ./apps/ingestion-service/
COPY --from=base /app/apps/ingestion-service/prisma ./apps/ingestion-service/prisma
COPY apps/ingestion-service/entrypoint.sh ./apps/ingestion-service/entrypoint.sh
RUN chmod +x ./apps/ingestion-service/entrypoint.sh

EXPOSE 3000

CMD ["sh", "./apps/ingestion-service/entrypoint.sh"]
