var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('User', new Schema({
  name: {type: String, required: true},
  hasPosted: {type: Boolean, required: true, default: false},
  isAdmin: {type: Boolean, required: true, default: false},
  score: {type: Number, default: null},
  division: {type: Number, min: 0, max: 5, required: true, default: 5},
  position: {type: Number, default: null},
  secret: {type: String, required: true},
  viewedNotice: {type: Boolean, default: false},
  lastLogin: {type: Date, default: null},
  history: [Number],
  divisionHistory: [Number],
  badges: {
    ace: {type: Number, default: 0},
    par: {type: Number, default: 0},
    top: {type: Number, default: 0},
    god: {type: Number, default: 0},
    bomb: {type: Number, default: 0},
    admin: {type: Number, default: 0},
    record: {type: Number, default: 0},
    bottom: {type: Number, default: 0},
    ten: {type: Number, default: 0},
    noscore: {type: Number, default: 0},
    blocked: {type: Number, default: 0},
    falling: {type: Number, default: 0},
    returning: {type: Number, default: 0},
    staying: {type: Number, default: 0},
    rising: {type: Number, default: 0}
  }
}));
