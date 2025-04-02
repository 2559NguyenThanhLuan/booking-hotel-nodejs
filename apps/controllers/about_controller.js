var express = require("express");

var router = express.Router();
var connection = require(__dirname + "/../database/db_config");
router.get("/", function(req, res) {
    const q = "SELECT * FROM team_details";

    connection.query(q, function(err, results){
        if(err) {
            console.error("Error fetching room: ", err.message);
            return res.status(500).send("Database error");
        }
        res.render("about.ejs", {team_details: results});
    })
})

module.exports = router;