import { useEffect, useState } from "react";
import {
  initializeDatabase,
  isDatabaseInitialized,
  getDatabaseStats,
  resetDatabase,
  seedDatabase,
} from "../services/database";

interface DatabaseStatus {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  stats: any;
}

/**
 * Custom hook to initialize the database on app startup
 * Usage: const { isInitialized, isLoading, error } = useDatabaseInit();
 *
 * @param forceReset - If true, drops all tables and reinitializes (clears all data)
 */
export function useDatabaseInit(forceReset: boolean = false): DatabaseStatus {
  const [status, setStatus] = useState<DatabaseStatus>({
    isInitialized: false,
    isLoading: true,
    error: null,
    stats: null,
  });

  useEffect(() => {
    async function setupDatabase() {
      try {
        console.log("🚀 Starting database setup...");

        if (forceReset) {
          console.log("⚠️ Force reset enabled - clearing all data...");
          await resetDatabase();
          console.log("🌱 Re-seeding database with fresh data...");
          await seedDatabase();
        } else {
          // Check if database is already initialized
          const initialized = await isDatabaseInitialized();

          if (!initialized) {
            console.log("📝 Database not found, initializing...");
            await initializeDatabase();
            console.log("🌱 Seeding database with initial data...");
            await seedDatabase();
          } else {
            console.log("✅ Database already initialized");
          }
        }

        // Get database statistics
        const stats = await getDatabaseStats();
        console.log("📊 Database stats:", stats);

        setStatus({
          isInitialized: true,
          isLoading: false,
          error: null,
          stats,
        });
      } catch (error) {
        console.error("❌ Database initialization failed:", error);
        setStatus({
          isInitialized: false,
          isLoading: false,
          error: error as Error,
          stats: null,
        });
      }
    }

    setupDatabase();
  }, [forceReset]);

  return status;
}
