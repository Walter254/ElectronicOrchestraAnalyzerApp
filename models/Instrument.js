const mongoose = require('mongoose');

const instrumentSchema = new mongoose.Schema({
  photo: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  spatialLocalization: {
    section: { type: String, required: true },
    row: { type: Number, required: true },
    position: { type: Number, required: true }
  },
  transcriptionOfNotes: { type: [String], required: true }
});

// Creating index on name for faster search operations within the schema definition
instrumentSchema.index({ name: 1 });

const Instrument = mongoose.model('Instrument', instrumentSchema);

module.exports = Instrument;