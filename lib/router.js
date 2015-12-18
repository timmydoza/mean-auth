var urlrouter = require('urlrouter');
var bodyParser = require('body-parser');
var httpBasic = require(__dirname + '/middleware/http_basic');
var async = require('async');

module.exports = function(users) {
  var router = urlrouter(function(app) {
    app.post('/signup', bodyParser.json(), function(req, res) {
      async.waterfall([
        function createUser(callback) {
          users.addUser(req.body.username, req.body.password, callback);
        },
        function sendToken(createdUser, callback) {
          if (createdUser === null) {
            res.json({msg: 'user name already exists'});
            callback(new Error('name is taken already'))
          } else {
            users.getToken(req.body.username, callback)
          }
        }
      ], function(err, token) {
        if (err) return console.log(err);
        res.json(token);
      });
    });

    app.get('/signin', httpBasic, function(req, res) {
      async.waterfall([
        function findUser(callback) {
          users.userExists(req.auth.username, callback);
        },
        function comparePasswordHash(userFound, callback) {
          if (!userFound) return callback(new Error('no such user'));
          users.checkHash(req.auth.username, req.auth.password, callback);
        },
        function sendToken(correctPassword, callback) {
          if (!correctPassword) return callback(new Error('bad password'));
          users.getToken(req.auth.username, callback);
        }
      ], function(err, token) {
        if (err) return res.status(401).send('bad login info');
        res.json(token);
      });
    });
  });
  return router;
};
