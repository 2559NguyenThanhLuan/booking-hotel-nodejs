var express = require("express");
const session = require("express-session");
const path = require('path');
const multer = require('multer');
var controller = require(__dirname + "/apps/controllers");
const settingsRouter = require("./apps/controllers/admin/setting_controller")
const features_facilities = require("./apps/controllers/admin/feature&facility_controller")
const roomsRouter = require("./apps/controllers/admin/rooms_controller");
const connection = require(__dirname + "/apps/database/db_config");

var app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");
app.use("/static", express.static(__dirname + "/public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: '123456',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.use(controller);

app.use('/admin', settingsRouter);
app.use('/admin', features_facilities)
app.use('/admin', roomsRouter)

var server = app.listen(3000, function() {
    console.log("Server chạy");
});