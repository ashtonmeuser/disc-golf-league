var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('User', new Schema({
  name: {type: String, required: true},
  hasPosted: {type: Boolean, required: true, default: false},
  isAdmin: {type: Boolean, required: true, default: false},
  score: {type: Number},
  division: {type: Number, min: 0, max: 3, required: true, default: 3},
  position: {type: Number},
  secret: {type: String, required: true}
}));
