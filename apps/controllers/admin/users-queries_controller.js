var express = require("express");
var connection = require("../../database/db_config");
var router = express.Router();
router.get("/", function(req, res) {
    const q = "SELECT * FROM user_queries";

    connection.query(q, function(err, results){
        if(err) {
            console.error("Error fetching user queries: ", err.message);
            return res.status(500).send("Database error");
        }
        res.render("admin/user_queries.ejs", {user_queries: results});
    })
})


module.exports = router;