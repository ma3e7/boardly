const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");

const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");

const authController = require("./controllers/authController");
const sessionsController = require("./controllers/sessionsController.js");

const PORT = process.env.PORT || 8000;

app.use(morgan("dev"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/assets"));
app.use(express.static(__dirname + "/public"));

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected on MongoDB: ${mongoose.connection.name}`);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passUserToView);

app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect(`/sessions/${req.session.user.username}/dashboard`);
  } else {
    res.render("index.ejs");
  }
});

app.use("/auth", authController);
app.use(isSignedIn);
app.use("/sessions", sessionsController);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
