#!/usr/bin/env node

// Test script for Neon Postgres connection
// Run with: node scripts/test-neon-connection.js

const { query, getDbConnection, closePool } = require('../lib/neon-db.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing Neon Postgres connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const pool = await getDbConnection();
    console.log('✅ Connection pool created successfully\n');

    // Test 2: Simple query
    console.log('2. Testing simple query...');
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query executed successfully');
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   Version: ${result.rows[0].pg_version.split(' ')[0]}\n`);

    // Test 3: Check if tables exist
    console.log('3. Checking database schema...');
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Tables found:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found. Run migration first.');
    }
    console.log();

    // Test 4: Test user operations (if tables exist)
    const expectedTables = ['users', 'prompts', 'library'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const hasRequiredTables = expectedTables.every(table => existingTables.includes(table));

    if (hasRequiredTables) {
      console.log('4. Testing CRUD operations...');
      
      // Test insert
      const testUserId = 'test_' + Date.now();
      await query(`
        INSERT INTO users (firebase_uid, email, credits, subscription_tier)
        VALUES ($1, $2, $3, $4)
      `, [testUserId, 'test@example.com', 5, 'free']);
      console.log('✅ Insert operation successful');

      // Test select
      const userResult = await query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [testUserId]
      );
      console.log('✅ Select operation successful');
      console.log(`   User created: ${userResult.rows[0].email}`);

      // Test update
      await query(
        'UPDATE users SET credits = $1 WHERE firebase_uid = $2',
        [10, testUserId]
      );
      console.log('✅ Update operation successful');

      // Test delete (cleanup)
      await query(
        'DELETE FROM users WHERE firebase_uid = $1',
        [testUserId]
      );
      console.log('✅ Delete operation successful');
      console.log('✅ CRUD test completed\n');
    } else {
      console.log('4. Skipping CRUD test - required tables not found\n');
    }

    // Test 5: Connection pool stats
    console.log('5. Connection pool information...');
    console.log(`✅ Pool created successfully`);
    console.log(`   Max connections: ${pool.options.max || 'default'}`);
    console.log(`   Idle timeout: ${pool.options.idleTimeoutMillis || 'default'}ms`);
    console.log();

    console.log('🎉 All tests passed! Neon Postgres is ready to use.');

  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   - Check your NEON_DATABASE_URL in .env.local');
      console.error('   - Verify your Neon database is running');
      console.error('   - Check your internet connection');
    }
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication issue:');
      console.error('   - Verify your database credentials');
      console.error('   - Check if your IP is whitelisted in Neon');
    }
    
    process.exit(1);
  } finally {
    // Clean up
    await closePool();
    console.log('\n🔒 Connection pool closed.');
  }
}

// Run the test
testConnection();
