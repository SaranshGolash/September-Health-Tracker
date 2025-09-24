// Controller for health tracker entries.
const entryModel = require('../models/entryModel');

/**
 * Helper to obtain the pg Pool from request (set in server.js as app.locals.db)
 */
function getPoolFromReq(req) {
  const pool = req.app && req.app.locals && req.app.locals.db;
  if (!pool) throw new Error('Database pool not available on request (app.locals.db)');
  return pool;
}

exports.listEntries = async (req, res) => {
  try {
    const pool = getPoolFromReq(req);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10) || 50, 1), 1000);
    const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);
    const rows = await entryModel.getAll(pool, { limit, offset });
    res.status(200).json(rows);
  } catch (err) {
    console.error('listEntries error:', err);
    res.status(500).json({ message: 'Error fetching entries' });
  }
};

exports.getEntry = async (req, res) => {
  try {
    const pool = getPoolFromReq(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid id' });
    const row = await entryModel.getById(pool, id);
    if (!row) return res.status(404).json({ message: 'Entry not found' });
    res.status(200).json(row);
  } catch (err) {
    console.error('getEntry error:', err);
    res.status(500).json({ message: 'Error fetching entry' });
  }
};

exports.createEntry = async (req, res) => {
  try {
    const pool = getPoolFromReq(req);
    const text = (req.body.entry || '').toString().trim();
    if (!text) return res.status(400).json({ message: 'Entry text is required' });
    const created = await entryModel.create(pool, text);
    res.status(201).json(created);
  } catch (err) {
    console.error('createEntry error:', err);
    res.status(500).json({ message: 'Error creating entry' });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const pool = getPoolFromReq(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid id' });
    const text = (req.body.entry || '').toString().trim();
    if (!text) return res.status(400).json({ message: 'Entry text is required' });
    const updated = await entryModel.update(pool, id, text);
    if (!updated) return res.status(404).json({ message: 'Entry not found' });
    res.status(200).json(updated);
  } catch (err) {
    console.error('updateEntry error:', err);
    res.status(500).json({ message: 'Error updating entry' });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const pool = getPoolFromReq(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid id' });
    const removed = await entryModel.remove(pool, id);
    if (!removed) return res.status(404).json({ message: 'Entry not found' });
    res.status(204).send();
  } catch (err) {
    console.error('deleteEntry error:', err);
    res.status(500).json({ message: 'Error deleting entry' });
  }
};