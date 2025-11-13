#!/usr/bin/env node

// Migration helper script for Prompt IQ
// This script helps with the migration process from Firestore to Neon Postgres

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function updateEnvFile(useNeon = false) {
  const envPath = join(process.cwd(), '.env.local');
  
  try {
    let envContent = readFileSync(envPath, 'utf8');
    
    // Update or add USE_NEON_DB
    if (envContent.includes('USE_NEON_DB=')) {
      envContent = envContent.replace(/USE_NEON_DB=.*/g, `USE_NEON_DB=${useNeon}`);
    } else {
      envContent += `\nUSE_NEON_DB=${useNeon}\n`;
    }
    
    writeFileSync(envPath, envContent);
    console.log(`✅ Updated .env.local: USE_NEON_DB=${useNeon}`);
  } catch (error) {
    console.error('❌ Error updating .env.local:', error.message);
  }
}

async function checkNeonConnection() {
  console.log('🔍 Testing Neon connection...');
  
  try {
    const { execSync } = await import('child_process');
    execSync('npm run test:neon', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('❌ Neon connection test failed');
    return false;
  }
}

async function runMigration() {
  console.log('🚀 Running database migration...');
  
  try {
    const { execSync } = await import('child_process');
    execSync('npm run migrate:run', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('❌ Migration failed');
    return false;
  }
}

async function main() {
  console.log('🎯 Prompt IQ - Neon Postgres Migration Helper\n');
  
  console.log('This script will help you migrate from Firestore to Neon Postgres.');
  console.log('Make sure you have:');
  console.log('1. Added NEON_DATABASE_URL to your .env.local');
  console.log('2. Installed dependencies with npm install');
  console.log('3. Your Neon database is accessible\n');
  
  const proceed = await question('Do you want to continue? (y/N): ');
  if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
    console.log('Migration cancelled.');
    rl.close();
    return;
  }
  
  console.log('\n📋 Migration Steps:\n');
  
  // Step 1: Test Neon connection
  console.log('Step 1: Testing Neon Postgres connection...');
  const connectionOk = await checkNeonConnection();
  
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed without a working Neon connection.');
    console.log('Please check your NEON_DATABASE_URL and try again.');
    rl.close();
    return;
  }
  
  console.log('\n✅ Neon connection successful!\n');
  
  // Step 2: Run migration
  console.log('Step 2: Running database schema migration...');
  const migrationOk = await runMigration();
  
  if (!migrationOk) {
    console.log('\n❌ Migration failed. Please check the errors above.');
    rl.close();
    return;
  }
  
  console.log('\n✅ Database migration completed!\n');
  
  // Step 3: Choose migration mode
  console.log('Step 3: Choose your migration approach:');
  console.log('1. Test mode (keep Firestore as primary, test Neon endpoints)');
  console.log('2. Full migration (switch to Neon as primary database)');
  console.log('3. Manual (I\'ll handle the environment variables myself)');
  
  const mode = await question('\nEnter your choice (1-3): ');
  
  switch (mode) {
    case '1':
      console.log('\n🧪 Setting up test mode...');
      await updateEnvFile(false);
      console.log('\nTest mode enabled. Your app will continue using Firestore.');
      console.log('You can test Neon endpoints by temporarily setting USE_NEON_DB=true');
      break;
      
    case '2':
      console.log('\n🚀 Setting up full migration...');
      const confirm = await question('⚠️  This will switch your app to use Neon Postgres. Continue? (y/N): ');
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        await updateEnvFile(true);
        console.log('\n✅ Full migration enabled! Your app is now using Neon Postgres.');
        console.log('Monitor your application closely and be ready to rollback if needed.');
      } else {
        console.log('Full migration cancelled.');
      }
      break;
      
    case '3':
      console.log('\n⚙️  Manual mode selected.');
      console.log('Set USE_NEON_DB=true in your .env.local when ready to switch to Neon.');
      break;
      
    default:
      console.log('Invalid choice. No changes made to environment.');
  }
  
  console.log('\n🎉 Migration setup complete!');
  console.log('\nNext steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Test all functionality thoroughly');
  console.log('3. Monitor for any issues');
  console.log('4. Check the DEPLOYMENT_CHECKLIST.md for detailed testing steps');
  
  console.log('\n💡 Rollback: Set USE_NEON_DB=false to revert to Firestore anytime');
  
  rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nMigration cancelled by user.');
  rl.close();
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Migration script error:', error);
  rl.close();
  process.exit(1);
});
