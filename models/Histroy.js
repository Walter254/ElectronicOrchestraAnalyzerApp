const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  timestamp: Date,
  instrument: String,
  section: String,
  row: String,
  position: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
  },
});

module.exports = mongoose.model('History', historySchema);