var express = require("express");
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

app.use(controller);
app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");
app.use("/static", express.static(__dirname + "/public"));

const connection = require(__dirname + "/apps/database/db_config");

var server = app.listen(3000, function() {
    console.log("Server chạy");
});