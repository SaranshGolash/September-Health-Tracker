const express = require('express');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');
const entryModel = require('./src/models/entryModel');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Build Postgres config from individual env vars (no DATABASE_URL)
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'Saransh@2003',
  database: process.env.PGDATABASE || 'september_health_tracker',
  // Optional SSL for production; enable by setting NODE_ENV=production and providing proper certs
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize DB and table(s)
(async () => {
  try {
    await pool.query('SELECT 1'); // simple connectivity check
    console.log('PostgreSQL connected');

    // Ensure entries table exists
    await entryModel.init(pool);
    console.log('Entries table ready');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL or models:', err);
    // Exit so the problem is noticed during startup
    process.exit(1);
  }
})();

// Make the pool available to routes/controllers
app.locals.db = pool;

// Routes (API)
const indexRouter = require('./src/routes/index');
app.use('/api', indexRouter);

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home
app.get('/', (req, res) => {
  res.render('index');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    try {
      await pool.end();
      console.log('PostgreSQL pool closed');
      process.exit(0);
    } catch (err) {
      console.error('Error closing PostgreSQL pool', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);