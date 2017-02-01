var Record = require('../model/record');

// End date

function setEndDate(string, callback) {
  if(/^\d{4}-\d{2}-\d{2}$/.test(string) === false) return callback({status: 400, message: 'Invalid date format.'});
  var date = new Date(string+'T00:00:00Z');

  Record.findOneAndUpdate(
    {key: 'endDate'},
    {value: date},
    {upsert: true},
    function(err, record) {
      if(err) return callback({status: 500, message: 'Unable to access database.'});
      callback(null);
    }
  );
}

// Course record

function setCourseRecord(score, callback) {
  if(score===null || !Number.isInteger(Number(score))) return callback({status: 400, message: 'Invalid score.'});

  Record.findOneAndUpdate(
    {key: 'courseRecord'},
    {$min: {value: score}},
    {upsert: true},
    function(err, record) {
      if(err) return callback({status: 500, message: 'Unable to access database.'});
      callback(null);
    }
  );
}

function getCourseRecord(callback) {
  Record.findOne({key: 'courseRecord'}, function(err, record) {
    if(err) return callback({status: 500, message: 'Unable to access database.'});
    callback(null, record ? record.value : null);
  });
}

module.exports = {
  setEndDate,
  setCourseRecord,
  getCourseRecord
}
