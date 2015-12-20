var app = require('express')();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var customRoles = ['admin', 'unicorn', 'butterfly']; // this is who is authorized to proceed on a path with roleAuth middleware

// server dev will write this function to obtain the user's role. Then the  array of authorized roles and the user's role obtained by this function must be passed into someFunc as the last line of the function
var getUserRole = function(req, res, checkAuthStatus){
  var userRole;
  userRole = req.user.roles[0]; // this is supplied by the user, and prob should be stored on user resource
  checkAuthStatus(customRoles, userRole);
};

var connection = mongoose.createConnection('mongodb://localhost/whatever');
var Authenticat = require(__dirname + '/../../index');
var authenticat = new Authenticat(connection);


app.use('/api', authenticat.router);

app.get('/secret', bodyParser.json(), authenticat.tokenAuth, authenticat.roleAuth(customRoles, getUserRole), function(req, res) {
  res.send('success!  Hello ' + req.user.username);
});

app.listen(3000, function() {
  console.log('ok');
});
