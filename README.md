# dynamodbexport

Command-line utility to export a DynamoDB database to a list of JSON documents.

## Installation

The *dynamodbexport* package is installed via npm:

```sh
npm install -g dynamodbexport
```

You may need to precede the above command with `sudo`, depending on your Node.js installation.

## Configuration

The *dynamodbexport* command-line tool assumes a [locally installed copy of DynamoDB](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) by default. If you want to use hosted DynamoDB, then
supply your AWS key and secret key as environment variables:

```sh
export AWS_ACCESS_KEY_ID="OGIIWJGNWNIITJHWTHSO"
export AWS_SECRET_ACCESS_KEY="YRPHIIIWJJJYwKLGV28JJuiuwnjiiqq06ASn"
```

or in a [shared credentials file](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html).

The AWS *Region* is set with the `-r` or `--region` command-line parameter.

## Command-line Usage

Use the *dynamodbexport* tool to export an entire DynamoDB table. The table is specified with the `-t` or `--table` command-line parameter:

```sh
$ dynamodbexport -t mytable -r us-east-1
{"temperature":8391,"time":"2017-03-09T01:38:11+0000","id":"1489023491"}
{"temperature":29130,"time":"2017-03-09T02:35:37+0000","id":"1489026937"}
{"temperature":27650,"time":"2017-03-08T18:35:58+0000","id":"1488998158"}
Export complete { iterations: 1, records: 3, time: 0.145 }
```

The data can be directed to a text file:

```sh
$ dynamodbexport -t mytable > mydata.txt
Export complete { iterations: 1, records: 3, time: 0.145 }
```

or piped elsewhere e.g. to [couchimport](https://www.npmjs.com/couchimport) to import the data into Apache CouchDB:

```sh
$ dynamodbexport --table mytable | couchimport --db mycouchtable --type jsonl
Export complete { iterations: 1, records: 3, time: 0.145 }
couchimport writecomplete { total: 3, totalfailed: 0 } +20ms
couchimport Import complete
```

## Programmatic Usage

You can also use the library within your own code:

```js
var dynamodbexport = require('dynamodbexport');
var region = 'us-east-1';
var table = 'mytable';
dynamodbexport.tableExport(region, table, function(err, data) {
  if (err) {
    console.error('ERROR', err)
  } else {
    console.error('Export complete', data)
  }
});
```

## Options Reference

### Command-line parameters

* -t or --table - the table to export (required)
* -r or --region - the AWS region to communicate with

### Environment variables

* AWS_ACCESS_KEY_ID - the AWS key
* AWS_SECRET_ACCESS_KEY - the AWS secret

N.B The *role* attache to the credentials you supply must have `DynamoDB.Scan` priveleges.