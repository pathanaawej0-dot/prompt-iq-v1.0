#!/usr/bin/env node

// Script to safely add Neon configuration to .env.local
// This script will ONLY APPEND new configuration without changing existing content

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const envPath = join(process.cwd(), '.env.local');

// Neon configuration to add
const neonConfig = `
# Neon Postgres Configuration - Added for migration
USE_NEON_DB=true
NEON_DATABASE_URL=postgresql://neondb_owner:npg_XncYxRgVAW71@ep-empty-darkness-ad2aji66-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
MIGRATION_SECRET=prompt_iq_migration_2024
`;

try {
  if (!existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    process.exit(1);
  }

  // Read existing content
  let existingContent = readFileSync(envPath, 'utf8');
  
  // Check if Neon config already exists
  if (existingContent.includes('USE_NEON_DB') || existingContent.includes('NEON_DATABASE_URL')) {
    console.log('⚠️  Neon configuration already exists in .env.local');
    console.log('Please check your .env.local file manually.');
    process.exit(0);
  }

  // Ensure there's a newline at the end of existing content
  if (!existingContent.endsWith('\n')) {
    existingContent += '\n';
  }

  // Append Neon configuration
  const newContent = existingContent + neonConfig;
  
  // Write back to file
  writeFileSync(envPath, newContent);
  
  console.log('✅ Successfully added Neon configuration to .env.local');
  console.log('📝 Added configuration:');
  console.log('   - USE_NEON_DB=true (App will now use Neon Postgres)');
  console.log('   - NEON_DATABASE_URL (Your Neon database connection)');
  console.log('   - MIGRATION_SECRET (For secure migration operations)');
  console.log('');
  console.log('🚀 Your app is now configured to use Neon Postgres!');
  console.log('💡 To revert back to Firestore, change USE_NEON_DB=false');

} catch (error) {
  console.error('❌ Error updating .env.local:', error.message);
  process.exit(1);
}
