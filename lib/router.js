var urlrouter = require('urlrouter');
var bodyParser = require('body-parser');
var httpBasic = require(__dirname + '/middleware/http_basic');
var async = require('async');
var roleAuth = require(__dirname + '/auth_roles');
var tokenAuth = require(__dirname + '/token_auth');
var changeRoles = require(__dirname + '/change_roles');


module.exports = function(users) {
  var router = urlrouter(function(app) {
    app.post('/signup', bodyParser.json(), function(req, res) {
      async.waterfall([
        function createUser(callback) {
          users.addUser(req.body.username, req.body.password, callback);
        },
        function sendToken(createdUser, callback) {
          if (createdUser === null) {
            //res.json({msg: 'user name already exists'});
            callback(new Error('name is taken already'));
          } else {
            users.getToken(req.body.username, callback);
          }
        }
      ], function(err, token) {
        if (err) return res.status(401).send('server error');
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

    app.put('/roles', bodyParser.json(), tokenAuth(users), roleAuth(users)(), function(req, res) {
      var oldRoles;
       if (!req.body.add && !req.body.remove) {
        return res.json({msg: 'specify "add" or "remove" in req.body'});
      }
      if (req.body.add){
        changeRoles.add(users)(req, res);
      }

      if (req.body.remove){
        changeRoles.remove(users)(req, res);
      }
    });
  });
  return router;
};
