const express = require('express');
const router = express.Router();
const Instrument = require('../models/Instrument');

// GET endpoint for fetching all instrument entries
router.get('/api/instruments', async (req, res) => {
  try {
    const instruments = await Instrument.find();
    console.log('Fetched all instruments successfully.');
    res.json(instruments);
  } catch (err) {
    console.error('Error fetching instruments:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;