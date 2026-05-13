import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';

/**
 * Must be imported before AppModule (see main.ts).
 * pnpm often uses the workspace root as cwd; local `nest` runs may use `apps/api`.
 */
function envFileCandidates(): string[] {
  const cwd = process.cwd();
  return [
    join(cwd, 'apps', 'api', '.env'),
    join(cwd, 'apps', 'api', '.env.local'),
    join(cwd, '.env'),
    join(cwd, '.env.local'),
    join(cwd, '..', '.env'),
    join(cwd, '..', '.env.local'),
    join(__dirname, '..', '.env'),
    join(__dirname, '..', '..', '.env'),
  ];
}

const candidates = [...new Set(envFileCandidates())];
for (const filePath of candidates) {
  if (existsSync(filePath)) {
    config({ path: filePath });
    break;
  }
}

if (!process.env.DATABASE_URL?.trim()) {
  const cwd = process.cwd();
  throw new Error(
    `DATABASE_URL is not set. Create a env file or export DATABASE_URL. ` +
      `cwd=${cwd}. Checked paths (first existing file is loaded): ${candidates.join(' | ')}. ` +
      `Typical fix: cp .env.example apps/api/.env`,
  );
}
