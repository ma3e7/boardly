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
    const sortField = req.query.sort || "date";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    let sortOption = {};
    if (sortField === "date") {
      sortOption.date = -1;
    } else if (sortField === "duration") {
      sortOption.duration = -1;
    }

    const query = {
      $or: [{ winner: loggedInUser._id }, { players: loggedInUser._id }],
    };

    const totalSessions = await Session.countDocuments(query);
    const totalPages = Math.ceil(totalSessions / limit);

    const sessions = await Session.find(query)
      .populate("winner", "username")
      .populate("players", "username")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.render("dashboard/mainDashboardView", {
      sessions,
      user: loggedInUser,
      page,
      totalPages,
      sortField,
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

router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.redirect(`/sessions/${req.session.user.username}/dashboard`);
  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(500).send("Server error");
  }
});

router.get("/:id/edit", ensureAuthenticated, async (req, res) => {
  try {
    const sessionData = await Session.findById(req.params.id)
      .populate("winner", "username")
      .populate("players", "username")
      .lean();

    res.render("dashboard/editSessionView", {
      sessionData,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Server error");
  }
});

router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { boardgame, winner, players, duration } = req.body;

    const winnerUser = await User.findOne({ username: winner });
    const playerUsers = await User.find({
      username: { $in: players.split(",").map((p) => p.trim()) },
    });

    if (!winnerUser || playerUsers.length === 0) {
      return res.send("Invalid player usernames.");
    }

    await Session.findByIdAndUpdate(req.params.id, {
      boardgame,
      winner: winnerUser._id,
      players: playerUsers.map((p) => p._id),
      duration: parseInt(duration),
    });

    res.redirect(`/sessions/${req.session.user.username}/dashboard`);
  } catch (err) {
    console.error("Error updating session:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
