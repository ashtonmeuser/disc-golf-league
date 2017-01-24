var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('User', new Schema({
  username: {type: String, required: true},
  hasPosted: {type: Boolean, required: true, default: false},
  score: {type: Number},
  division: {type: String, enum: ['Gold','Silver','Bronze','Unranked'], required: true, default: 'Unranked'},
  position: {type: Number},
  secret: {type: String, required: true}
}));
