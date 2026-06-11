import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from './index.js';

const queryClient = postgres(config.database.url, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);

export async function checkDatabase(): Promise<boolean> {
  try {
    await queryClient`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  await queryClient.end();
}
