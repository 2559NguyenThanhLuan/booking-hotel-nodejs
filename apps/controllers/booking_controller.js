var express = require("express");
var router = express.Router();
var connection = require(__dirname + "/../database/db_config");

router.get("/", function(req, res) {

    if (!req.session.user) {
        return res.redirect("/auth");
    }
    const roomId = req.query.id;
    if (!roomId) {
        return res.status(400).send("Room ID is required");
    }
    req.session.user = {
        id: req.session.user.id,
        name: req.session.user.name,
        email: req.session.user.email,
        phonenum: req.session.user.phonenum,
        address: req.session.user.address,
        role: req.session.user.role
    };
    const q = "SELECT * FROM rooms WHERE id = ?";
    connection.query(q, [roomId], function(err, results) {
        if (err) {
            console.error("Error fetching room: ", err.message);
            return res.status(500).send("Database error");
        }
        res.render("booking.ejs", { rooms: results,
            user: req.session.user
         });
    });
});

module.exports = router;