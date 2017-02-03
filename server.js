var express = require('express');
var Cookies = require('cookies');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var user = require('./controller/user');
var record = require('./controller/record');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/discgolfleague');

// Login

app.use(user.authenticate);

app.post('/login', function(req, res, next) {
  var cookies = new Cookies(req, res);
  var name = req.body.name;
  var secret = req.body.secret;
  var expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  cookies.set('discgolfleague', JSON.stringify({name: name, secret: secret}), {overwrite: true, expires: expiryDate});
  res.redirect('/');
});

// Admin

app.post('/place', function(req, res, next) {
  if(!req.user.isAdmin) return next({status: 401, message: 'Admin access only.'});
  if(req.body.password !== process.env.DISCGOLFADMINPASSWORD) return next({status: 401, message: 'Invalid Admin password.'});
  var date = req.body.date;
  user.place(date, function(err){
    if(err) return next(err);
    res.redirect('/');
  });
});

app.post('/user', function(req, res, next) {
  if(!req.user.isAdmin) return next({status: 401, message: 'Admin access only.'});
  user.create(req.body.name, req.body.secret, function(err) {
    if(err) return next(err);
    res.json({success: true});
  });
});

// Main

app.get('/', function(req, res, next) {
  user.playersByDivision('position', function(err, players) {
    if(err) return next(err);
    record.getDateDiff(function(err, dateDiff) {
      if(err) return next(err);
      res.render('pages/index', {user: req.user, players: players, dateDiff: dateDiff, divisions: user.divisions, badges: user.badges});
    });
  });
});

app.post('/post', function(req, res, next) {
  var score = req.body.score;
  var competitive = req.body.competitive;
  var ace = req.body.ace;
  user.post(req.user, score, competitive, ace, function(err) {
    if(err) return next(err);
    res.redirect('/');
  });
});

// Error

app.use(function(err, req, res, next) {
  if(res.headersSent || err.status===undefined || err.message===undefined) return next(err);
  console.log(err.message);
  res.status(err.status).render('pages/error', {error: err.message});
});

// Not found

app.use(function (req, res, next) {
  res.redirect('/');
});

app.listen(app.get('port'), function() {
  console.log('Node app running on port ', app.get('port'));
});
