var Cookies = require('cookies');
var groupArray = require('group-array');
var User = require('../model/user');

function authenticate(req, res, next) {
  if(req.path == '/login') return next();
  var cookies = new Cookies(req, res);
  var cookie = cookies.get('discgolfleague');

  try{
    user = JSON.parse(cookie);
  }catch(err){
    return res.render('pages/login');
  }
  if(user.name === undefined || user.secret === undefined) return res.render('pages/login');

  User.findOne({name: user.name, secret: user.secret}, 'name division position score hasPosted isAdmin', function(err, user) {
    if(err) return next({status: 500, message: 'Unable to access database.'});
    if(user === null){
      return res.render('pages/login');
    }else{
      req.user = user;
      return next();
    }
  });
}

function create(name, secret, callback) {
  var user = new User({
    name: name,
    secret: secret
  });
  user.save(function(err) {
    if(err) return callback({status: 500, message: 'Unable to access database.'});
    callback(null);
  });
}

function post(user, score, callback) {
  user.score = score;
  user.hasPosted = true;
  user.save(function(err) {
    if(err) return callback({status: 500, message: 'Unable to save score.'});
    callback(null);
  });
}

function divisions(sort, callback) {
  if(sort!=='position' && sort!=='score') return callback({status: 400, message: 'Must sort by position or score.'});
  User.find({}, 'name division position score', function(err, users) {
    if(err) return callback({status: 500, message: 'Unable to access database.'});
    users.sort(function(a, b) {
      return a[sort] - b[sort];
    });
    var players = groupArray(users, 'division');
    callback(null, players);
  });
}

function place(callback) {
  divisions('score', function(err, players) {
    Object.keys(players).forEach(function(division) {
      var divisionIndex = Number(division);
      console.log('div '+division);
      players[division].forEach(function(player, playerIndex) {
        console.log('player '+player.name+' pos '+playerIndex);
        if(playerIndex===players[division].length-1 && players[divisionIndex+1]){
          var challenger = players[divisionIndex+1][0];
          console.log('challenger '+challenger.name);
          if((challenger.score!==null && player.score===null) || challenger.score < player.score){
            challenger.division = divisionIndex;
            player.division = divisionIndex+1;
            console.log(challenger.name+' beats '+player.name);
          }
        }
      });
    });
  });
}

module.exports = {
  create,
  authenticate,
  divisions,
  post,
  place
}
