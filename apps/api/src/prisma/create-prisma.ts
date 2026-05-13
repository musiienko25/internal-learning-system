import { PrismaPg } from '@prisma/adapter-pg';
import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

export function prismaClientConstructorOptions(): Prisma.PrismaClientOptions {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  return {
    adapter: new PrismaPg({ connectionString }),
  };
}

/** Used by Prisma seed script (runs outside Nest DI). */
export function createDatabasePrismaClient(): PrismaClient {
  return new PrismaClient(prismaClientConstructorOptions());
}
