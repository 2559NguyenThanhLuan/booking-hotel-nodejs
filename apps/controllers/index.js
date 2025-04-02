var express = require("express");

var router = express.Router();
router.use("/about", require(__dirname + "/about_controller"));
router.use("/services", require(__dirname + "/services_controller"));
router.use("/rooms", require(__dirname + "/rooms_controller"));
router.use("/contact", require(__dirname + "/contact_controller"));
router.use("/login", require(__dirname + "/login_controller"));
router.use("/404", require(__dirname + "/404_controller"));
router.get("/", function(req, res) {
    res.render("index.ejs");
})

module.exports = router;