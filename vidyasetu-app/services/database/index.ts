// Database configuration and schema exports
export { db, schema } from "./db-config";

// Migration utilities
export {
  initializeDatabase,
  isDatabaseInitialized,
  getDatabaseStats,
  resetDatabase,
} from "./migrations";

// Seeding function
export { seedDatabase } from "./seed-all";

// Schema exports for direct imports
export * from "./schema";
