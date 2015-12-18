var app = require('express')();
var Authenticat = require(__dirname + '/../../index');
var authenticat = new Authenticat('mongodb://localhost/whatever');
var bodyParser = require('body-parser');

app.use('/api', authenticat.router);

app.get('/secret', authenticat.middleware, function(req, res) {
  res.send('success!');
});

app.listen(3000, function() {
  console.log('ok');
});
