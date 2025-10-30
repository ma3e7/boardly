const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  timesWon: { type: Number, default: 0 },
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
