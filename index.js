
var async = require('async');
var AWS = require('aws-sdk');
var convertAmazonJSON = require('./lib/convert.js');

// AWS library
//AWS.config.loadFromPath('./config.json');
var dynamoDB = null;

// export a table to JSON
var tableExport = function(region, table, callback) {

  // default to local DynamoDB
  var config = {};

  // if we don't have environment variables
  if (!process.env.AWS_ACCESS_KEY_ID && ! process.env.AWS_SECRET_ACCESS_KEY) {

    // assume local DynamoDB
    config = { endpoint: new AWS.Endpoint('http://localhost:8000'), region: 'local' };
  } else {
    
    // otherwise use the passed-in region
    config = { region: region };
  }
  var dynamoDB = new AWS.DynamoDB(config);

  // scan the whole table in chunks
  var scan = function(table, callback) {
    var lastReply = null;
    var iterations = 0;
    var records = 0;
    var query = {
      TableName: table,
      Limit: 100,
    };
    var start = new Date().getTime();

    async.doUntil(function(cb) {
      dynamoDB.scan(query, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        var items = data.Items;
        lastReply = data;
        iterations++;

        // loop through each item and output as JSON
        for (var i in items) {
          var item = items[i];
          var obj = {};
          for (j in item) {
            obj[j] = convertAmazonJSON(item[j]);
          }
          records++;
          console.log(JSON.stringify(obj));
        }

        cb(null, null)
      });
    }, function() {
      if (lastReply.LastEvaluatedKey) { // Result is incomplete; there is more to come.
        query.ExclusiveStartKey = lastReply.LastEvaluatedKey;
        return false;
      }
      return true;
    }, function(e, r) {
      var end = new Date().getTime();
      callback(e, { iterations: iterations, records: records, time: (end - start)/1000 });
    });
  };
  
  // perform the scan
  scan(table, callback);
};

module.exports = {
  tableExport: tableExport
}