const express = require("express");
const router = express.Router();
const Session = require("../models/SessionsModel");
const User = require("../models/UsersModel");

function ensureAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/auth/signInForm");
}

router.get("/:username/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    const loggedInUser = req.session.user;

    const sessions = await Session.find({
      $or: [{ winner: loggedInUser._id }, { players: loggedInUser._id }],
    })
      .populate("winner", "username")
      .populate("players", "username")
      .sort({ date: -1 })
      .lean();

    res.render("dashboard/mainDashboardView", {
      sessions,
      user: loggedInUser,
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).send("Server error");
  }
});

router.post("/add", ensureAuthenticated, async (req, res) => {
  try {
    const { boardgame, winner, players, duration } = req.body;

    const winnerUser = await User.findOne({ username: winner });
    const playerUsers = await User.find({
      username: { $in: players.split(",").map((p) => p.trim()) },
    });

    if (!winnerUser || playerUsers.length === 0) {
      return res.send("Invalid player usernames.");
    }

    const newSession = new Session({
      boardgame,
      winner: winnerUser._id,
      players: playerUsers.map((p) => p._id),
      duration: parseInt(duration),
    });

    await newSession.save();
    res.redirect(`/sessions/${req.session.user.username}/dashboard`);
  } catch (err) {
    console.error("Error adding session:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
