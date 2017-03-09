#!/usr/bin/env node

var commander = require('commander');
var package = require('../package.json');
var dynamodbexport = require('..');

// parse command-line parameters
commander
  .version(package.version)
  .option('-t, --table [tablename]', 'Add the table you want to output to csv')
  .option('-r, --region [regionname]', 'The AWS region where your DynamoDB instance is hosted')
  .parse(process.argv);

// table is mandatory
if (!commander.table) {
  console.log('You must specify a table');
  commander.outputHelp();
  process.exit(1);
}

// do the export
dynamodbexport.tableExport(commander.region, commander.table, function(err, data) {
  if (err) {
    console.error('ERROR', err)
  } else {
    console.error('Export complete', data)
  }
});

