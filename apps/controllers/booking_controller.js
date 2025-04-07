var express = require("express");
var router = express.Router();
var connection = require(__dirname + "/../database/db_config");

router.get("/", function(req, res) {
    const roomId = req.query.id;
    if (!roomId) {
        return res.status(400).send("Room ID is required");
    }
    // req.session.user = {
    //     name: user.name,
    //     email: user.email,
    //     phonenum: user.phonenum,
    //     dob: user.dob,
    //     address: user.address
    // };
    const q = "SELECT * FROM rooms WHERE id = ?";
    connection.query(q, [roomId], function(err, results) {
        if (err) {
            console.error("Error fetching room: ", err.message);
            return res.status(500).send("Database error");
        }
        res.render("booking.ejs", { rooms: results });
    });
});

module.exports = router;