var Cookies = require('cookies');
var groupArray = require('group-array');
var User = require('../model/user');
var record = require('./record');

var divisions = ['Non Mortal','Gold','Silver','Bronze','Unranked'];
var badges = ['ten','ace','admin','top','par','bottom','record','god','bomb','noscore'];

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

  User.findOne({name: user.name, secret: user.secret}, 'name division position score hasPosted isAdmin history badges viewedNotice', function(err, user) {
    if(err) return next({status: 500, message: 'Unable to access database.'});
    if(user === null){
      return res.render('pages/login');
    }else{
      record.getRecords(function(err, records) {
        if(err) return next(err);
        if(user.viewedNotice) records['notice'] = null;
        calculateBadges(user, records['courseRecord']);
        user.lastLogin = new Date();
        user.viewedNotice = true;
        user.save(function(err) {
          if(err) return next({status: 500, message: 'Unable to access database.'});
          req.records = records;
          req.user = user;
          return next();
        });
      });
    }
  });
}

function calculateBadges(user, courseRecord) {
  if(user.isAdmin) user.badges.admin = 1;
  user.badges.record = (courseRecord!==undefined && Math.min.apply(null, user.history)<=courseRecord) ? 1 : 0;
  user.badges.ten = Math.floor(user.history.length/10);
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
  score = Number(score);
  user.history.push(score);
  if(competitive && !user.hasPosted){
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

function resetViewedNotice(callback) {
  User.update({}, {viewedNotice: false}, {multi: true}, function(err) {
    if(err) return callback({status: 500, message: 'Unable to save score.'});
    callback(null);
  });
}

function playersByDivision(sort, courseRecord, callback) {
  if(sort!=='position' && sort!=='score') return callback({status: 400, message: 'Must sort by position or score.'});
  User.find({}, 'name division position score badges isAdmin history', function(err, users) {
    if(err) return callback({status: 500, message: 'Unable to access database.'});
    users.sort(function(a, b) {
      if(a[sort]===null && b[sort]===null) return a.position - b.position;
      else if(a[sort]===null) return 1;
      else if(b[sort]===null) return -1;
      else return a[sort] - b[sort];
    });
    users.forEach(function(user) {
      calculateBadges(user, courseRecord);
    });
    var players = groupArray(users, 'division');
    callback(null, players);
  });
}

function place(date, courseRecord, callback) {
  playersByDivision('score', courseRecord, function(err, players) {
    if(err) return callback(err);

    // Calculate new standings
    var worstScore = null;
    Object.keys(players).forEach(function(division) {
      var divisionIndex = Number(division);
      var nextDivision = String(divisionIndex+1);
      var player = players[division][players[division].length-1];
      if(player.score!==null && (worstScore===null || player.score>worstScore)) worstScore = player.score;
      if(players[nextDivision] === undefined) return;
      var challenger = players[nextDivision][0];

      if((challenger.score!==null && player.score===null) || challenger.score<player.score){
        players[division].pop();
        players[nextDivision].splice(0, 1);
        players[division].push(challenger);
        players[nextDivision].unshift(player);
      }
    });

    // Reset scores, save players
    var divisionBasePosition = 0;
    Object.keys(players).forEach(function(division) {
      var divisionIndex = Number(division);
      players[division].forEach(function(player, playerIndex) {
        player.division = divisionIndex;
        player.position = divisionBasePosition+playerIndex;
        if(player.score!==null && player.score===worstScore) player.badges.bomb++;
        if(player.score==null) player.badges.noscore++;
        if(divisionIndex === 0){
          player.badges.god++;
        }else if(divisionIndex===1 && playerIndex===0){
          player.badges.top++;
        }else if(divisionIndex===divisions.length-1 && playerIndex===players[division].length-1){
          player.badges.bottom++;
        }
        player.score = null;
        player.hasPosted = false;
        player.save(function(err) {
          if(err) return callback({status: 500, message: 'Unable to save score.'});
        });
      });
      divisionBasePosition += players[division].length;
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
  badges,
  playersByDivision,
  post,
  place,
  resetViewedNotice
}
