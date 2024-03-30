const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  sessionLabel: { type: String, required: true },
  instruments: [{
    id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    section: { type: String, required: true },
    row: { type: Number, required: true }, // Changed type to Number
    position: { type: Number, required: true }, // Changed type to Number
    transcriptionOfNotes: [{ type: String, required: true }], // Ensure this is an array of strings
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

historySchema.pre('save', function(next) {
  if (!this.sessionLabel) {
    console.error('Attempt to save history without session label');
    next(new Error('Session label is required'));
  } else if (!this.instruments || this.instruments.length === 0) {
    console.error('Attempt to save history without instruments');
    next(new Error('Cannot save history without instruments'));
  } else {
    console.log('Saving history for session label:', this.sessionLabel);
    next();
  }
});

historySchema.post('save', function(doc, next) {
  console.log('History saved successfully for session label:', doc.sessionLabel);
  next();
});

const History = mongoose.model('History', historySchema);

module.exports = History;