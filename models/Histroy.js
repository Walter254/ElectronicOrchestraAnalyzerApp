const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  timestamp: Date,
  instrument: String,
  angleOfArrival: String,
  distance: String,
  photoUrl: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
});

module.exports = mongoose.model('History', historySchema);
