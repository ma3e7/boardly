const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/UsersModel");

router.get("/signInForm", (req, res) => {
  res.render("auth/signInView");
});
router.get("/signUpForm", (req, res) => {
  res.render("auth/signUpView");
});

router.get("/signOut", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.post("/signUp", async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) return res.send("Username already taken.");

    if (req.body.password !== req.body.confirmPassword) {
      return res.send("Passwords must match.");
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;

    await User.create(req.body);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

router.post("/signIn", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) return res.send("Login failed. Try again.");

    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    if (!validPassword) return res.send("Invalid credentials.");

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    res.redirect(`/sessions/${userInDatabase.username}/dashboard`);
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

module.exports = router;
