const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_booking'
});

connection.connect((err) => {
    if(err) {
        console.log('Error connecting to MySQL: ', err.message);
        return;
    }
    console.log('Connected to MySQL succeed!');
})

module.exports = connection;