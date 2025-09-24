// PostgreSQL connection helpers (using node-postgres).
const { Pool } = require('pg');

let pool = null;

function buildConfig() {
    return {
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'september_health_tracker',
        // Enable SSL only in production if required by provider
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };
}

/**
 * Initialize and test a PostgreSQL Pool. Returns the pool instance.
 * Call this once during app startup (e.g. from server.js).
 */
async function initPool() {
    if (pool) return pool;
    pool = new Pool(buildConfig());
    try {
        await pool.query('SELECT 1');
        console.log('PostgreSQL connected (pool ready)');
        return pool;
    } catch (err) {
        console.error('PostgreSQL connection failed:', err);
        try { await pool.end(); } catch (_) {}
        pool = null;
        throw err;
    }
}

/**
 * Get the initialized pool. Throws if initPool() was not called.
 */
function getPool() {
    if (!pool) throw new Error('PostgreSQL pool not initialized. Call initPool() first.');
    return pool;
}

/**
 * Close the pool (useful for graceful shutdown / tests).
 */
async function closePool() {
    if (!pool) return;
    await pool.end();
    pool = null;
    console.log('PostgreSQL pool closed');
}

module.exports = {
    initPool,
    getPool,
    closePool,
};