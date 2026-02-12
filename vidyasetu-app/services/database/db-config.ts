// services/database/db-config.ts - Database configuration

import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// Open SQLite database (change name to force fresh DB)
const expoDb = openDatabaseSync("career_guide_v4.db");
export const db = drizzle(expoDb, { schema });

export { schema };
