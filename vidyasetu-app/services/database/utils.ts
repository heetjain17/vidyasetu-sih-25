import { db } from './db-config';
import { sql } from 'drizzle-orm';

/**
 * Utility to list all tables in the database
 */
export async function listTables() {
  try {
    const tables = await db.all<{ name: string }>(sql`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `);
    return tables;
  } catch (error) {
    console.error('Error listing tables:', error);
    return [];
  }
}

/**
 * Get table schema information
 */
export async function getTableInfo(tableName: string) {
  try {
    const info = await db.all(sql.raw(`PRAGMA table_info(${tableName})`));
    return info;
  } catch (error) {
    console.error(`Error getting info for table ${tableName}:`, error);
    return [];
  }
}

/**
 * Drop all tables (use with caution!)
 */
export async function dropAllTables() {
  try {
    const tables = await listTables();
    
    // Disable foreign keys temporarily
    await db.run(sql`PRAGMA foreign_keys = OFF`);
    
    // Drop each table
    for (const table of tables) {
      if (table.name !== 'sqlite_sequence') {
        await db.run(sql.raw(`DROP TABLE IF EXISTS ${table.name}`));
        console.log(`Dropped table: ${table.name}`);
      }
    }
    
    // Re-enable foreign keys
    await db.run(sql`PRAGMA foreign_keys = ON`);
    
    console.log('All tables dropped successfully');
    return true;
  } catch (error) {
    console.error('Error dropping tables:', error);
    return false;
  }
}
