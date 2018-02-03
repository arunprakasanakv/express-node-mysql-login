const mysql = require('mysql');

//creating mysql conn
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'palaniM@67',
  database : 'hackowl'
});

//conn
db.connect((err) => {
	if (err) {
		throw err;
	}
	// console.log("mysql connected");
});

// db.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });

module.exports = db;