const router = require('express').Router();
const passport = require('passport');
const { limiter , slower } = require('../config/requestRate');

// auth login
router.get('/login', (req, res) => {
    res.render('acesso', { user: req.user });
});


// auth logout
router.get('/logout', slower(), (req, res) => {
    req.logout();
    res.redirect('/');
});

// auth with google+
router.get('/google',  slower(), passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect',  slower(), passport.authenticate('google'), (req, res) => {
    req.session.userData = req.session.passport.user
    res.redirect("/notas");
});


module.exports = router;