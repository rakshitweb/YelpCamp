const passport = require('passport');
const User = require('../models/user');

module.exports.renderRegisterForm = (req,res) => {
    res.render('users/register.ejs');
}

module.exports.registerUser = async(req,res, next) => {
    try{
    const {firstName, lastName, email, username, password} = req.body;
    const user = new User({firstName, lastName, email, username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
        if(err) {
            return next();
        }
        req.flash('success', 'Welcome to Yelp-Camp 2021!');
        res.redirect('/campgrounds');
    })
    req.flash('success', 'Successfully created your account!');
    res.redirect('/campgrounds');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLoginForm = (req,res) => {
    res.render('users/login.ejs');
}

module.exports.loginUser = (req,res) => {
    req.flash('success', 'Welcome Back!');
    const redirectedUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectedUrl);
}

module.exports.logoutUser = (req,res) => {
    req.logout();
    req.flash('success', 'Successfully Logout!');
    res.redirect('/campgrounds');
}