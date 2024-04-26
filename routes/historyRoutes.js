const express = require('express');
const router = express.Router();
const History = require('../models/History');
const { isAuthenticated } = require('./middleware/authMiddleware');

// Fetch the history data for the logged-in user
router.get('/api/history', isAuthenticated, async (req, res) => {
  try {
    const historyData = await History.find({ userId: req.session.userId }).sort({ timestamp: 'descending' });
    console.log('Fetched history data successfully');
    res.json(historyData);
  } catch (error) {
    console.error('Error fetching history data:', error.message, error.stack);
    res.status(500).send('Error fetching history data');
  }
});

// Handle the "Done" action on the instruments page and save the viewed instruments
router.post('/api/history', isAuthenticated, async (req, res) => {
  try {
    const { sessionLabel, instruments } = req.body;
    console.log('Received session label:', sessionLabel); 
    console.log('Received instruments:', instruments); 
    if (!sessionLabel) {
      console.log('Session label is required but not provided');
      return res.status(400).send('Session label is required');
    }
    if (!instruments || instruments.length === 0) {
      console.log('No instruments provided to save in history');
      return res.status(400).send('At least one instrument is required');
    }
    // Validate and transform instruments data
    const processedInstruments = instruments.map(instrument => {
      return {
        id: instrument.id,
        name: instrument.name,
        angleOfArrival: instrument.angleOfArrival,
        distance: instrument.distance,
        photoUrl: instrument.photoUrl
      };
    });
    
    const newHistoryEntry = new History({
      sessionLabel,
      instruments: processedInstruments,
      userId: req.session.userId,
    });
    await newHistoryEntry.save();
    console.log('New history entry saved successfully');
    res.json({ message: 'History updated successfully' });
  } catch (error) {
    console.error('Error saving new history entry:', error.message, error.stack);
    res.status(500).send('Error saving history entry');
  }
});

module.exports = router;