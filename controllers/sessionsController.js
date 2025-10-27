const express = require("express");
const router = express.Router();

router.get("/:username/dashboard", (req, res) => {
  res.render("dashboard/mainDashboardView.ejs", {
    username: req.params.username,
  });
});

module.exports = router;
