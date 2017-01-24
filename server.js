var express = require('express');
var Cookies = require('cookies');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var groupArray = require('group-array');
var User = require('./model/user');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/discgolfleague');

// Login
app.get('/*', function(req, res, next) {
  console.log('get');
  var cookies = new Cookies(req, res);
  var cookie = cookies.get('discgolfleague');

  try{
    user = JSON.parse(cookie);
  }catch(err){
    return res.render('pages/login');
  }
  if(user.username === undefined || user.secret === undefined) return res.render('pages/login');

  User.findOne({username: user.username, secret: user.secret}, 'username division position score hasPosted', function(err, user) {
    if(err) return next({status: 500, message: 'Unable to access database.'});
    if(user === null){
      return res.render('pages/login');
    }else{
      req.user = user;
      return next();
    }
  });
});

app.post('/', function(req, res, next) {
  var cookies = new Cookies(req, res);
  var username = req.body.username;
  var secret = req.body.secret;

  cookies.set('discgolfleague', JSON.stringify({username: username, secret: secret}));
  return res.redirect('/');
});

app.get('/', function(req, res, next) {
  console.log(req.user);
  User.find({}, 'username division', function(err, users) {
    if(err) return next({status: 500, message: 'Unable to access database.'});
    var players = groupArray(users, 'division');
    res.render('pages/index', {user: req.user, players: players});
  });
});

app.post('/user', function(req, res, next) {
  var user = new User({
    username: req.body.username,
    secret: req.body.secret
  });
  user.save(function(err) {
    res.redirect('/');
  });
});

// Error
app.use(function(err, req, res, next) {
  if(res.headersSent) return next(err);
  console.log(err.message);
  res.status(err.status).json({error: err.message});
});

app.listen(app.get('port'), function() {
  console.log('Node app running on port ', app.get('port'));
});
