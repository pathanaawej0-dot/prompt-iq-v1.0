import { Pool } from 'pg';

// Create a connection pool for Neon Postgres
let pool = null;

function createPool() {
  if (!pool) {
    if (!process.env.NEON_DATABASE_URL) {
      throw new Error('NEON_DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      // Connection pool settings optimized for Neon
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 60000, // Close idle clients after 60 seconds
      connectionTimeoutMillis: 10000, // Wait up to 10 seconds for connection
      acquireTimeoutMillis: 10000, // Wait up to 10 seconds to acquire connection from pool
      statement_timeout: 30000, // 30 second statement timeout
      query_timeout: 30000, // 30 second query timeout
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
}

// Get a database connection from the pool
export async function getDbConnection() {
  const dbPool = createPool();
  return dbPool;
}

// Execute a query with parameters
export async function query(text, params = []) {
  const dbPool = createPool();
  const start = Date.now();
  
  try {
    const result = await dbPool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Execute a transaction
export async function transaction(callback) {
  const dbPool = createPool();
  const client = await dbPool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Close the connection pool (useful for testing or graceful shutdown)
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default { query, transaction, getDbConnection, closePool };
