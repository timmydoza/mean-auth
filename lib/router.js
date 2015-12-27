var urlrouter = require('urlrouter');
var bodyParser = require('body-parser');
var httpBasic = require(__dirname + '/middleware/http_basic');
var async = require('async');
var roleAuth = require(__dirname + '/auth_roles');
var tokenAuth = require(__dirname + '/token_auth');
var errorHandler = require(__dirname + '/error_handler');

module.exports = function(users) {
  var router = urlrouter(function(app) {
    app.post('/signup', bodyParser.json(), function(req, res) {
      async.waterfall([
        function createUser(callback) {
          users.addUser(req.body.username, req.body.password, callback);
        },
        function sendToken(createdUser, callback) {
          if (createdUser === null) {
            callback('username exists');
          } else {
            users.getToken(req.body.username, callback);
          }
        }
      ], function(err, token) {
        if (err) return errorHandler(err, res);
        res.json(token);
      });
    });

    app.get('/signin', httpBasic, function(req, res) {
      async.waterfall([
        function findUser(callback) {
          users.userExists(req.auth.username, callback);
        },
        function comparePasswordHash(userFound, callback) {
          if (!userFound) return callback('not authenticated');
          users.checkHash(req.auth.username, req.auth.password, callback);
        },
        function sendToken(correctPassword, callback) {
          if (!correctPassword) return callback('not authenticated');
          users.getToken(req.auth.username, callback);
        }
      ], function(err, token) {
        if (err) return errorHandler(err, res);
        res.json(token);
      });
    });

    app.put('/roles', bodyParser.json(), tokenAuth(users), roleAuth(users)(), function(req, res) {
      var oldRoles;
      if (!req.body.add && !req.body.remove) {
        return errorHandler('no add or remove', res);
      }
      if (req.body.add) {
        return users.addRole(req.body.username, req.body.add, function(err, data) {
          if (err) return errorHandler(err, res);
          res.json({msg: 'added role of ' + req.body.add + ' to ' + req.body.username});
        });
      }
      if (req.body.remove) {
        return users.removeRole(req.body.username, req.body.remove, function(err, data) {
          if (err) return errorHandler(err, res);
          res.json({msg: 'removed role of ' + req.body.remove + ' from ' + req.body.username});
        });
      }
    });
  });
  return router;
};
