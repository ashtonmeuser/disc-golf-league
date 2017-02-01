var Cookies = require('cookies');
var groupArray = require('group-array');
var User = require('../model/user');
var record = require('./record');

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

  User.findOne({name: user.name, secret: user.secret}, 'name division position score hasPosted isAdmin history badges', function(err, user) {
    if(err) return next({status: 500, message: 'Unable to access database.'});
    if(user === null){
      return res.render('pages/login');
    }else{
      record.getCourseRecord(function(err, courseRecord) {
        if(err) return next(err);
        if(user.isAdmin) user.badges.admin = 1;
        if(Math.min.apply(null, user.history) <= courseRecord) user.badges.record = 1;
        req.user = user;
        return next();
      });
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

function post(user, score, competitive, ace, callback) {
  user.history.push(score);
  if(competitive){
    user.score = score;
    user.hasPosted = true;
  }
  if(ace){
    user.badges.ace++;
  }
  if(score <= 0){
    user.badges.par++;
  }
  user.save(function(err) {
    if(err) return callback({status: 500, message: 'Unable to save score.'});
    record.setCourseRecord(score, function(err) {
      if(err) return callback(err);
      callback(null);
    });
  });
}

function divisions(sort, callback) {
  if(sort!=='position' && sort!=='score') return callback({status: 400, message: 'Must sort by position or score.'});
  User.find({}, 'name division position score badges', function(err, users) {
    if(err) return callback({status: 500, message: 'Unable to access database.'});
    users.sort(function(a, b) {
      if(a[sort]===null && b[sort]===null) return a.position - b.position;
      else if(a[sort]===null) return 1;
      else if(b[sort]===null) return -1;
      else return a[sort] - b[sort];
    });
    var players = groupArray(users, 'division');
    callback(null, players);
  });
}

function place(date, callback) {
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
        if(player.position === 0){
          player.badges.top++;
        }
        player.score = null;
        player.hasPosted = false;
        player.save(function(err) {
          if(err) return callback({status: 500, message: 'Unable to save score.'});
        });
      });
    });

    record.setEndDate(date, function(err) {
      if(err) return callback(err);
      return callback(null);
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
