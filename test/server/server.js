var app = require('express')();
var Authenticat = require(__dirname +'/../../index');
var authenticat = new Authenticat('mongodb://localhost/whatever');

app.use('/api', authenticat.router);


app.listen(3000, function() {
  console.log('ok');
});
