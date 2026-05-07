FROM node:20-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/patients-mfe/package.json ./apps/patients-mfe/

RUN pnpm install --frozen-lockfile

COPY apps/patients-mfe/ ./apps/patients-mfe/

WORKDIR /app/apps/patients-mfe
RUN pnpm run build

FROM nginx:stable-alpine
COPY --from=build /app/apps/patients-mfe/dist /usr/share/nginx/html
# Configuration Nginx pour supporter Module Federation (CORS, etc.)
COPY apps/patients-mfe/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5001
CMD ["nginx", "-g", "daemon off;"]
