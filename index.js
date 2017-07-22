
var async = require('async');
var AWS = require('aws-sdk');
var convertAmazonJSON = require('./lib/convert.js');

// export a table to JSON
var tableExport = function(region, table, callback, pauseTime) {
  pauseTime = pauseTime || 0

  // if we don't have environment variables
  var config = {};
  if (!process.env.AWS_ACCESS_KEY_ID && ! process.env.AWS_SECRET_ACCESS_KEY) {
    
    // assume local DynamoDB
    console.error('dynamodbexport - using local DynamoDB (localhost:8000)');
    config = { 
      endpoint: new AWS.Endpoint('http://localhost:8000'), 
      region: 'local', 
      accessKeyId: 'local', 
      secretAccessKey: 'local' 
    };
  } else {
    
    // otherwise use the passed-in region
    console.error('dynamodbexport - using remote DynamoDB');
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

    // keep going until we're finished
    async.doUntil(function(cb) {

      // do table scan
      dynamoDB.scan(query, function(err, data) {
        if (err) {
          return callback(err, null);
        }

        // extract the data bit
        var items = data.Items;
        lastReply = data;

        // keep tally of how many DynamoDB requests we make
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
        setTimeout(function(){ cb(null, null) }, pauseTime)
      });
    }, function() {
      // check to see if we've more work to do
      if (lastReply.LastEvaluatedKey) { // Result is incomplete; there is more to come.
        query.ExclusiveStartKey = lastReply.LastEvaluatedKey;
        return false;
      }
      // if we're done, return true
      return true;
    }, function(e, r) {

      // calculate execution time and return summary object
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