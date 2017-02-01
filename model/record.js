var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('Record', new Schema({
  key: {type: String, required: true},
  value: {type: Schema.Types.Mixed, required: true, default: null}
}));
