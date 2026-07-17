const mongoose = require('mongoose')

const studySessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  minutes: {
    type: Number,
    required: true
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })

module.exports = mongoose.model('StudySession', studySessionSchema)