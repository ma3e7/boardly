const isSignedIn = (req, res, next) => {
  if (req.session.user) return next();
  console.log("session ID:", req.session.user);
  res.redirect("/auth/sign-in");
};

module.exports = isSignedIn;
