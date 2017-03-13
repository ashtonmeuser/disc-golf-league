var sanitizeHtml = require('sanitize-html');
var Record = require('../model/record');

// All records

function getRecords(callback) {
  Record.find({}, 'key value', function(err, records) {
    if(err) return callback({status: 500, message: 'Unable to access database.'});
    var recordMap = {};
    records.forEach(function(record) {
      recordMap[record.key] = record.value;
    });
    callback(null, recordMap);
  });
}

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

function getDateDiff(endDate) {
  if(endDate===null || endDate===undefined) return null;
  var delta = endDate - new Date() + 8*60*60*1000; // Account for timezone difference
  if(Math.abs(delta) > 24*60*60*1000){ // Days
    return Math.floor(delta/(24*60*60*1000))+' days';
  }else if(Math.abs(delta) > 60*60*1000){ // Hours
    return Math.floor(delta/(60*60*1000))+' hours';
  }else if(Math.abs(delta) > 60*1000){ // Minutes
    return Math.floor(delta/(60*1000))+' minutes';
  }else{ // Seconds
    return Math.floor(delta/1000)+' seconds';
  }
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

// Notice

function setNotice(message, callback) {
  if(message==='') return callback({status: 400, message: 'Invalid message.'});
  message = sanitizeHtml(message.substring(0, 500), {allowedTags: [], allowedAttributes: []});
  message = message.trim().replace(/(?:\r\n|\r|\n)/g, '</p><p>');
  message = '<p>'+message+'</p>'
  Record.findOneAndUpdate(
    {key: 'notice'},
    {value: message},
    {upsert: true},
    function(err, record) {
      if(err) return callback({status: 500, message: 'Unable to access database.'});
      callback(null);
    }
  );
}

module.exports = {
  getRecords,
  setEndDate,
  getDateDiff,
  setCourseRecord,
  setNotice
}
