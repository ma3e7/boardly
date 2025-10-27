const mongoose = require('mongoose');

const boardgameSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const Boardgame = mongoose.model('Boardgame', boardgameSchema);
module.exports = Boardgame;
