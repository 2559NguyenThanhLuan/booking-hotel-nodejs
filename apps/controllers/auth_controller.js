exports.register = function(req, res) {
    const { name, email, address, phonenum, dob, password, cpassword } = req.body;
    const connection = require(__dirname + "/../database/db_config");
    const bcrypt = require("bcrypt");

    const hashedPassword = bcrypt.hashSync(password, 10);
    connection.query("INSERT INTO user_cred (name, email, address, phonenum, dob, password) VALUES (?, ?, ?,?,?,?)", [name, email, address, phonenum, dob, hashedPassword], function(err, result) {
        if (err) {
            console.error("Error inserting user: ", err.message);
            return res.status(500).send("Database error");
        }
        res.redirect("/");
    });
}

exports.login = function(req, res) {
    const { email, password } = req.body;
    const connection = require(__dirname + "/../database/db_config");
    const bcrypt = require("bcrypt");

    connection.query("SELECT * FROM user_cred WHERE email = ?", [email], function(err, results) {
        if (err) {
            console.error("Error fetching user: ", err.message);
            return res.status(500).send("Database error");
        }

        if (results.length === 0) {
            return res.status(401).send("Invalid email or password");
        }

        const user = results[0];
        const isValidPassword = bcrypt.compareSync(password, user.password);

        if (!isValidPassword) {
            return res.status(401).send("Invalid email or password");
        }
        req.session.user = {name: user.name,
                            email: user.email,
                            phonenum: user.phonenum,
                            dob: user.dob,
                            address: user.address};
        res.redirect("/");
    });
}
exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.error("Error destroying session: ", err.message);
            return res.status(500).send("Database error");
        }
        res.redirect("/");
    });
}
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(new GoogleStrategy({
    clientID: '717932257463-pffrbb5lv07j7oeogo2kpos275k40v1s.apps.googleusercontent.com',
    clientSecret: '',
    callbackURL: "/auth/google/callback"
}, function(accessToken, refreshToken, profile, done) {
    const user = {
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value
    };
    done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
