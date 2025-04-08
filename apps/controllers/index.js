var express = require("express");

var router = express.Router();
var connection = require(__dirname + "/../database/db_config");
router.use("/about", require(__dirname + "/about_controller"));
router.use("/services", require(__dirname + "/services_controller"));
router.use("/rooms", require(__dirname + "/rooms_controller"));
router.use("/contact", require(__dirname + "/contact_controller"));
router.use("/auth", require(__dirname + "/../route/auth_route"));
router.use("/404", require(__dirname + "/404_controller"));
router.use("/booking", require(__dirname + "/booking_controller"));
router.use("/admin", require(__dirname + "/admin/index"));

function queryToPromise(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            if(err) reject(err);
            else resolve(results);
        });
    });
}

router.get("/", async function(req, res) {
    try {
        const [rooms, features, facilities, team_details] = await Promise.all([
            queryToPromise("SELECT * FROM rooms LIMIT 3"),
            queryToPromise("SELECT * FROM features LIMIT 3"),
            queryToPromise("SELECT * FROM facilities LIMIT 3"),
            queryToPromise("SELECT * FROM team_details"),
        ]);

        res.render("index.ejs", {
            rooms: rooms,
            features: features,
            facilities: facilities,
            team_details: team_details
        });
    } catch(err) {
        console.error("Error fetching: ", err.message);
        res.status(500).send("Database error");
    }
});

router.get("/profile", function(req, res) {
    res.render("profile.ejs");
});

module.exports = router;