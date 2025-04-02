var express = require("express");

var router = express.Router();
var connection = require(__dirname + "/../database/db_config");

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
        const [features, facilities] = await Promise.all([
            queryToPromise("SELECT * FROM features"),
            queryToPromise("SELECT * FROM facilities"),
        ]);

        res.render("services.ejs", {
            features: features,
            facilities: facilities,
        });
    } catch(err) {
        console.error("Error fetching: ", err.message);
        res.status(500).send("Database error");
    }
});

module.exports = router;