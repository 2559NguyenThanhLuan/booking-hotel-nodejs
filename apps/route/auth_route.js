var express = require("express");
var router = express.Router();
const auth_controller = require(__dirname + "/../controllers/auth_controller");
const passport = require('passport');

router.get("/", function(req, res) {
    res.render("login.ejs");
});

router.post("/register", auth_controller.register);
router.post("/login", auth_controller.login);
router.post("/logout", auth_controller.logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        req.session.user = req.user;
        res.redirect('/profile');
    }
);
module.exports = router;