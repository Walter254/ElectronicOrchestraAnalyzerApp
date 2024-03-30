const express = require('express');
const router = express.Router();
const Instrument = require('../models/Instrument');

// Endpoint to fetch all instruments
router.get('/api/instruments', async (req, res) => {
  try {
    const instruments = await Instrument.find({});
    console.log('Fetched all instruments successfully');
    res.json(instruments);
  } catch (error) {
    console.error('Error fetching instruments:', error.message, error.stack);
    res.status(500).send('Error fetching instruments');
  }
});

// Endpoint to fetch a single instrument by ID
router.get('/api/instruments/:id', async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
      console.log(`Instrument with ID ${req.params.id} not found`);
      return res.status(404).send('Instrument not found');
    }
    console.log(`Fetched instrument with ID ${req.params.id} successfully`);
    res.json(instrument);
  } catch (error) {
    console.error('Error fetching instrument:', error.message, error.stack);
    if (error.kind === 'ObjectId') {
      return res.status(404).send('Invalid Instrument ID');
    }
    res.status(500).send('Error fetching instrument');
  }
});

module.exports = router;