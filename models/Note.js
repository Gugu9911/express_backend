const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  images: {
    type: [String], // This will allow an array of strings
  },
}, {
  timestamps: true, // This will add fields for createdAt and updatedAt
});

module.exports = mongoose.model('Note', NoteSchema);
