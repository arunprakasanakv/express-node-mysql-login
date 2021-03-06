var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var hbs = require('hbs');

//authen package
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MySQLStore = require('express-mysql-session')(session);
var bcrypt = require('bcrypt');

var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'palaniM@67',
    database: 'hackowl'
};
 
var sessionStore = new MySQLStore(options);

var index = require('./routes/index');
var users = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  key: 'user_id',
  secret: 'bitch',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use('/', index);
app.use('/users', users);

passport.use(new LocalStrategy({ usernameField: 'emailid', passwordField: 'password' },
  function(username, password, done) {
      const db = require('./db');
      db.query('SELECT id, password FROM profile WHERE emailid = ?',[username],function(err,results,fields){
        if (err) { done(err) };

        if (results.length === 0) {
          done(null,false);
        }
        const hash = results[0].password.toString();
        
        bcrypt.compare(password, hash, function(err, response){
          if (response === true) {
            return done(null, {user_id:results[0].id});
          }
          else{
            return done(null, false);
          }
        });
      })
    }
));

// Socket.io starts

// Socket.io ends

// catch 404 and forward to error handler
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

module.exports = app;
