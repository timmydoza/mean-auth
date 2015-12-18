var app = require('express')();
var Authenticat = require(__dirname + '/../../index');
var authenticat = new Authenticat('mongodb://localhost/whatever');

app.use('/api', authenticat.router);

app.get('/secret', authenticat.tokenAuth, function(req, res) {
  res.send('success!  Hello ' + req.user);
});

app.listen(3000, function() {
  console.log('ok');
});
