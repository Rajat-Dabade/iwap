var express = require('express');
var bodyParser = require('body-parser');
var controller = require('./controllers/controller');
var mysql = require('mysql');
var expressValidator = require('express-validator');
var expressSession = require('express-session');

var urlencodedParser = bodyParser.urlencoded({ extended: false });


var app = express();

app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'))
app.use(expressValidator());
app.use(expressSession({secret: 'max', saveUninitialized : false, resave : false}));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bank"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


controller(app, urlencodedParser, con);


app.listen(3000, function(){
	console.log("The is the website");
});