var express = require('express');
var router = express.Router();

var expressValidator = require('express-validator');

var session = require('express-session');
var passport = require('passport');


var bcrypt = require('bcrypt');
const saltRounds = 10;

/* Login Route */
router.get('/', function(req, res, next) {
	res.render('home', { title: 'Home' });
});

router.get('/login', function(req, res, next) {
	if (req.isAuthenticated()){
		res.redirect('/profile');
	}
	else{
		res.render('login', { title: 'Login' });
	}
});

router.post('/login', passport.authenticate('local',{
	successRedirect: '/profile',
	failureRedirect: '/login'
}));

/* End Login Route */

/* Register Route */

router.get('/register', function(req, res, next) {
	if (req.isAuthenticated()){
		res.redirect('/profile');
	}
	else{
		res.render('index', { title: 'Sign up' });
	}
});

router.post('/register', function(req, res, next) {
	req.checkBody('passwordmatch', 'password does not match').equals(req.body.password);

	const errors = req.validationErrors();

	if(errors){
		console.log(`errors: ${JSON.stringify(errors)}`);

		res.render('index', { title: 'Registration error',errors: errors });
	}
	else{
		const db = require('../db.js');
		const username = req.body.name;
		const password = req.body.password;
		const email = req.body.emailid;

		bcrypt.hash(password, saltRounds, function(err, hash) {
		  // Store hash in your password DB.
		  db.query('INSERT INTO profile (username,password,emailid) VALUES (?,?,?)',[username,hash,email],function(err,results,fields){
				if (err) {
					throw err;
				}
				db.query('SELECT LAST_INSERT_ID() as user_id',function(error,results,fields){
					if(error) throw error;

					const user_id = results[0];

					console.log(results[0]);
					req.login(user_id, function(err){
						res.redirect('/');
					})

					res.render('index', { title: 'Registration Compltete' });
				});				
			});	
		});
	}
	// res.send(req.body);
});

/* End Register Route */

router.get('/logout', function(req, res, next) {
	req.logout();
	req.session.destroy();
	res.redirect('/');
});

/* profile route */
router.get('/profile', authenticationMiddleware(), function(req, res, next) {
	var id = req.session.passport.user.user_id;
	const db = require('../db.js');
		db.query('SELECT * FROM profile WHERE id = ?',[id],function(error,results,fields){
			if(error) throw error;
			console.log(results[0].id);
			res.render('profile', { title: 'Profile',data :results[0] });
		});
});

router.post('/profile', authenticationMiddleware(), function(req, res, next) {
	var id = req.session.passport.user.user_id;
	const db = require('../db.js');
	const username = req.body.username;
	const password = req.body.password;
	const emailid = req.body.emailid;
	bcrypt.hash(password, saltRounds, function(err, hash) {
		var data = {
			username:username,
			emailid:emailid,
			password:hash
		};
		db.query('UPDATE profile set ? WHERE id = ?',[data,id],function(error,results,fields){
			if(error) throw error;
			res.render('profile', { title: 'Profile',notify:'updated',data :data});
		});
	});
});
/* profile end */

	passport.serializeUser(function(user_id, done) {
	  done(null, user_id);
	});

	passport.deserializeUser(function(user_id, done) {
	    done(null, user_id);
	});

function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	if (req.isAuthenticated()) return next();
		res.redirect('/login')
	}
}

module.exports = router;
