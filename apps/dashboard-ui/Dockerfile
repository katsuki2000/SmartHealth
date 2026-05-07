FROM node:20-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/dashboard-ui/package.json ./apps/dashboard-ui/

RUN pnpm install --frozen-lockfile

COPY apps/dashboard-ui/ ./apps/dashboard-ui/

WORKDIR /app/apps/dashboard-ui
RUN pnpm run build

FROM nginx:stable-alpine
COPY --from=build /app/apps/dashboard-ui/dist /usr/share/nginx/html
COPY apps/dashboard-ui/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]
