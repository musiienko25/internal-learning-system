#!/bin/sh
set -e
cd /app/apps/api
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
exec node dist/src/main.js
