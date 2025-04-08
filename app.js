var express = require("express");
<<<<<<< HEAD
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var order = require('./apps/routes/order');
=======
const session = require("express-session");
const path = require('path');
const multer = require('multer');
var controller = require(__dirname + "/apps/controllers")
const settingsRouter = require("./apps/controllers/admin/setting_controller")
const features_facilities = require("./apps/controllers/admin/feature&facility_controller")
const roomsRouter = require("./apps/controllers/admin/rooms_controller");
const connection = require(__dirname + "/apps/database/db_config");
>>>>>>> c2fb9dc4e2a3443ddef1949a15855ba75faed5b5

var app = express();

<<<<<<< HEAD
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(controller);
=======
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
>>>>>>> c2fb9dc4e2a3443ddef1949a15855ba75faed5b5
app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");
app.use("/static", express.static(__dirname + "/public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

<<<<<<< HEAD
app.use('/order', order);
const connection = require(__dirname + "/apps/database/db_config");
=======
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
>>>>>>> c2fb9dc4e2a3443ddef1949a15855ba75faed5b5

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

var server = app.listen(3000, function() {
<<<<<<< HEAD
    console.log(`Server is running with http://localhost:3000/`);
=======
    console.log("Server chạy");
>>>>>>> c2fb9dc4e2a3443ddef1949a15855ba75faed5b5
});