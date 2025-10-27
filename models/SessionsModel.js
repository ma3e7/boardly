const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  duration: Number,
  date: { type: Date, default: Date.now },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  boardgame: { type: mongoose.Schema.Types.ObjectId, ref: 'Boardgame' }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
