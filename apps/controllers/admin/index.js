var express = require("express");

var router = express.Router();

router.use("/user-queries", require(__dirname + "/users-queries_controller"));
router.use("/settings", require(__dirname + "/setting_controller"));
router.use("/features-facilities", require(__dirname + "/feature&facility_controller"));
router.use("/rooms", require(__dirname + "/rooms_controller"));


router.get("/", async function(req, res) {
   res.render("admin/index.ejs");
})

module.exports = router;