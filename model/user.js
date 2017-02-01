var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('User', new Schema({
  name: {type: String, required: true},
  hasPosted: {type: Boolean, required: true, default: false},
  isAdmin: {type: Boolean, required: true, default: false},
  score: {type: Number, default: null},
  division: {type: Number, min: 0, max: 3, required: true, default: 3},
  position: {type: Number, default: null},
  secret: {type: String, required: true},
  history: [Number],
  badges: {
    ace: {type: Number, default: 0},
    par: {type: Number, default: 0},
    top: {type: Number, default: 0},
    admin: {type: Number, default: 0},
    record: {type: Number, default: 0}
  }
}));
