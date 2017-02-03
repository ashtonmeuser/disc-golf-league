var Record = require('../model/record');

// End date

function setEndDate(string, callback) {
  if(/^\d{4}-\d{2}-\d{2}$/.test(string) === false) return callback({status: 400, message: 'Invalid date format.'});
  var date = new Date(string+'T23:59:59Z');

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

function getEndDate(callback) {
  Record.findOne({key: 'endDate'}, function(err, record) {
    if(err) return callback({status: 500, message: 'Unable to access database.'});
    callback(null, record ? record.value : null);
  });
}

function getDateDiff(callback) {
  getEndDate(function(err, endDate) {
    if(err) return callback(err);
    if(endDate === null) return callback(null, null);
    var delta = endDate - new Date() + 8*60*60*1000; // Account for timezone difference
    if(delta < 60*1000){ // Seconds
      callback(null, Math.floor(delta/1000)+' seconds');
    }else if(delta < 60*60*1000){ // Minutes
      callback(null, Math.floor(delta/(60*1000))+' minutes');
    }else if(delta < 24*60*60*1000){ // Hours
      callback(null, Math.floor(delta/(60*60*1000))+' hours');
    }else{ // Days
      callback(null, Math.floor(delta/(24*60*60*1000))+' days');
    }
  });
}

// Course record

function setCourseRecord(score, callback) {
  if(score===null || !Number.isInteger(Number(score))) return callback({status: 400, message: 'Invalid score.'});

  Record.findOneAndUpdate(
    {key: 'courseRecord'},
    {$min: {value: Number(score)}},
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
  getDateDiff,
  setCourseRecord,
  getCourseRecord
}
