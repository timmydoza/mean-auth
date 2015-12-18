var app = require('express')();
var mongoose = require('mongoose');
var Authenticat = require(__dirname + '/../../index');
var connection = mongoose.conncect('mongodb://localhost/whatever');
var authenticat = new Authenticat(connection);

app.use('/api', authenticat.router);

app.get('/secret', authenticat.tokenAuth, function(req, res) {
  res.send('success!  Hello ' + req.user);
});

app.listen(3000, function() {
  console.log('ok');
});
