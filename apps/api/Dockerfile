FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile

COPY apps/api apps/api

WORKDIR /app/apps/api

# prisma.config.ts uses env("DATABASE_URL"); generate does not connect, value must only resolve
ENV DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/dummy?schema=public"

RUN pnpm exec prisma generate && pnpm run build

COPY apps/api/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
