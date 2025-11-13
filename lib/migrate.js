import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from './neon-db.js';

// Run database migrations
export async function runMigrations() {
  try {
    console.log('Starting database migration...');
    
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'migrations', '001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    
    console.log('Database migration completed successfully!');
    return { success: true, message: 'Migration completed' };
  } catch (error) {
    console.error('Migration failed:', error);
    throw new Error(`Migration failed: ${error.message}`);
  }
}

// Check if tables exist
export async function checkTablesExist() {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'prompts', 'library', 'folders', 'history', 'playground', 'payments', 'feedback', 'email_subscriptions')
      ORDER BY table_name;
    `);
    
    const expectedTables = ['users', 'prompts', 'library', 'folders', 'history', 'playground', 'payments', 'feedback', 'email_subscriptions'];
    const existingTables = result.rows.map(row => row.table_name);
    
    return {
      allExist: expectedTables.every(table => existingTables.includes(table)),
      existing: existingTables,
      missing: expectedTables.filter(table => !existingTables.includes(table))
    };
  } catch (error) {
    console.error('Error checking tables:', error);
    return { allExist: false, existing: [], missing: [], error: error.message };
  }
}

export default { runMigrations, checkTablesExist };
