var app = require('express')();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var customRoles = ['admin', 'unicorn', 'butterfly', 'more booze'];

var getUserRole = function(req, res, checkAuthStatus){
  var userRole;
  userRoles = req.user.roles;
  checkAuthStatus(userRoles);
};

var connection = mongoose.createConnection('mongodb://localhost/whatever');
var Authenticat = require(__dirname + '/../../index');
var authenticat = new Authenticat(connection);

app.use('/api', authenticat.router);

app.get('/secret', bodyParser.json(), authenticat.tokenAuth, authenticat.roleAuth(customRoles, getUserRole), function(req, res) {
  res.send('success!  Hello ' + req.user.username);
});

app.listen(3000, function() {
  console.log('server up on port 3000');
});
