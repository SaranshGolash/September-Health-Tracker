const express = require('express');
const router = express.Router();

// ensure this path matches the actual controller filename: healthController.js
const healthController = require('../controllers/healthController');

// sanity-check the controller exports so errors are clear at startup
const expected = ['listEntries', 'getEntry', 'createEntry', 'updateEntry', 'deleteEntry'];
for (const fn of expected) {
  if (typeof healthController[fn] !== 'function') {
    throw new Error(`Controller function missing or not a function: ${fn} in src/controllers/healthController.js`);
  }
}

// API routes (mounted at /api in server.js)
router.get('/entries', healthController.listEntries);
router.get('/entries/:id', healthController.getEntry);
router.post('/entries', healthController.createEntry);
router.put('/entries/:id', healthController.updateEntry);
router.delete('/entries/:id', healthController.deleteEntry);

module.exports = router;