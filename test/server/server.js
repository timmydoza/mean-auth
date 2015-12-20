var app = require('express')();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


var roleAuth= require(__dirname + '/../../lib/auth_roles');
var roles = ['admin', 'regularUser']; // this is who is authorized to proceed on a path with roleChecker middleware
var cb = function(req, res, someFunc){  // the auth_roles file forces this someFunc to be my "magicFunction"
  var role;
  role = 'regularUser'; // this is supplied by the user, and prob shoudl come from token or be stored on user resource
  someFunc(roles, role); // pass roles and role into magicFunction
};


var connection = mongoose.createConnection('mongodb://localhost/whatever');
var Authenticat = require(__dirname + '/../../index');
var authenticat = new Authenticat(connection);


app.use('/api', authenticat.router);

app.get('/secret', bodyParser.json(), authenticat.tokenAuth, roleAuth(roles, cb), function(req, res) {
  res.send('success!  Hello ' + req.user);
});

app.listen(3000, function() {
  console.log('ok');
});
