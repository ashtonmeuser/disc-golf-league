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
    if(err) return callback(err);

    // Calculate new standings
    Object.keys(players).forEach(function(division) {
      var divisionIndex = Number(division);
      var nextDivision = String(divisionIndex+1);
      if(players[nextDivision] === undefined) return;
      var player = players[division][players[division].length-1];
      var challenger = players[nextDivision][0];

      if((challenger.score!==null && player.score===null) || challenger.score<player.score){
        players[division].pop();
        players[nextDivision].splice(0, 1);
        players[division].push(challenger);
        players[nextDivision].unshift(player);
      }
    });

    // Reset scores, save players
    Object.keys(players).forEach(function(division) {
      var divisionIndex = Number(division);
      players[division].forEach(function(player, playerIndex) {
        player.division = divisionIndex;
        player.position = player.division*4+playerIndex;
        player.score = null;
        player.hasPosted = false;
        player.save(function(err) {
          if(err) return callback({status: 500, message: 'Unable to save score.'});
        });
      });
    });
    
    callback(null);
  });
}

module.exports = {
  create,
  authenticate,
  divisions,
  post,
  place
}
