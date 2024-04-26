const mongoose = require('mongoose');

const instrumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  angleOfArrival: {
    type: Number,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  photoUrl: {
    type: String,
    required: false
  }
});

instrumentSchema.pre('save', function(next) {
  console.log(`Saving instrument: ${this.name}`);
  next();
});

const Instrument = mongoose.model('Instrument', instrumentSchema);

module.exports = Instrument;