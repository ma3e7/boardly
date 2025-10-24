const express = require('express');
const router = express.Router();

router.get('/signInForm', (req, res) => {
    res.render('auth/signInView');
});

router.get('/signUpForm', (req, res) => {
    res.render('auth/signUpView');
});

module.exports = router;
