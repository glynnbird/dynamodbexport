var convertAmazonJSON = function(thing) {
  // the thing you get back from DynamoDB looks like this:
  //   Authors: { L: [ { S: 'Dickens'} , {S: 'Austen' } ] }
  // we want
  //   Authors: [ 'Dickens', 'Austen' ]
  var retval = '';
  if (typeof thing === 'object') {
    var k = Object.keys(thing)[0];
    var val = thing[k];
    switch(k) {
      case 'N':
        retval = parseInt(val);
      break;
      case 'L':
        retval = [];
        for(var i in val) {
          retval.push(convertAmazonJSON(val[i]));
        }
      break;
      case 'BOOL':
      case 'S': 
      default: 
        retval = val; 
    }  
  }
  return retval;
};

module.exports = convertAmazonJSON;