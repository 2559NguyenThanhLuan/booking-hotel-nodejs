var express = require("express");
const path = require('path');
const multer = require('multer');
const session = require("express-session");
var app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
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

var controller = require(__dirname + "/apps/controllers");
const settingsRouter = require("./apps/controllers/admin/setting_controller")
const features_facilities = require("./apps/controllers/admin/feature&facility_controller")
const roomsRouter = require("./apps/controllers/admin/rooms_controller");

app.use(controller);
app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");
app.use("/static", express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const connection = require(__dirname + "/apps/database/db_config");

app.use('/admin', settingsRouter);
app.use('/admin', features_facilities)
app.use('/admin', roomsRouter)
var server = app.listen(3000, function() {
    console.log("Server chạy");
});