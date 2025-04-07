var express = require("express");

var router = express.Router();
var connection = require("../../database/db_config");
router.get("/", function(req, res) {
    const q = "SELECT * FROM rooms";

    connection.query(q, function(err, results){
        if(err) {
            console.error("Error fetching room: ", err.message);
            return res.status(500).send("Database error");
        }
        res.render("admin/rooms.ejs", {rooms: results});
    })
})

router.post("/addRooms", function(req, res) {
    try {
        const {name, area, price, quantity, adult, children, desc} = req.body;
        const q = "INSERT INTO `rooms`(`name`, `area`, `price`, `quantity`, `adult`, `children`, `description`) VALUES (?,?,?,?,?,?,?)"

        connection.query(q, [name,area, price, quantity, adult, children, desc], function(err){
            if(err) console.log(err)
            res.redirect("/admin/rooms");
        })
    } catch (error) {
        
    }
})

router.post("/deleteRooms/:id", function(req, res) {
    try {
        const id = req.params.id;
        const q = "DELETE FROM `rooms` WHERE id=?"

        connection.query(q, [id], function(err){
            if(err) console.log(err)
            res.redirect("/admin/rooms");
        })
    } catch (error) {
        
    }
})
module.exports = router;