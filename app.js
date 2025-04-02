var express = require("express");

var app = express();
var controller = require(__dirname + "/apps/controllers");

app.use(controller);
app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");
app.use("/static", express.static(__dirname + "/public"));

const connection = require(__dirname + "/apps/database/db_config");
connection.query('SELECT * FROM rooms', (err, res) => {
    if(err) {
        console.error('Query error: ', err.message);
        return;
    }
    console.log('Data from database: ', res);
})

var server = app.listen(3000, function() {
    console.log("Server is running!");
});