import type { Config } from 'drizzle-kit';

export default {
  schema: './services/database/schema.ts',
  out: './drizzle',
  driver: 'expo',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'local.db',
  },
} satisfies Config;
