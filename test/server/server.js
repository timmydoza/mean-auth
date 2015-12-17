var app = require('express')();
var mongodb = require('mongodb').MongoClient;
var Authenticat = require(__dirname +'/../../index');

mongodb.connect('mongodb://localhost/whatever', function(err, db) {
  var authenticat = new Authenticat(db);
  app.use('/api', authenticat.router);
});

app.listen(3000, function() {
  console.log('ok');
});
