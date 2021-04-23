const express = require('express');
const passport = require('passport');
const user = require('../controllers/users');
const router = express.Router();

router.route('/register')
    .get(user.renderRegisterForm)
    .post(user.registerUser)

router.route('/login')
    .get(user.renderLoginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), user.loginUser)

router.get('/logout', user.logoutUser)

module.exports = router;