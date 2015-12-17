var urlrouter = require('urlrouter');
var bodyParser = require('body-parser');
var httpBasic = require(__dirname + '/middleware/http_basic');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var async = require('async');
var secret = process.env.APP_SECRET || 'changeme';

module.exports = function(instance) {
  var users = instance.connection.collection('users');
  var router = urlrouter(function(app) {
    app.post('/signup', bodyParser.json(), function(req, res) {
      async.waterfall([
        function hash(callback) {
          bcrypt.hash(req.body.password, 8, callback);
        },
        function save(hashedPassword, callback) {
          users.insert({
            username: req.body.username,
            password: hashedPassword
          }, callback);
        },
        function token(arg1, callback) {
          jwt.sign({username: req.body.username}, secret, null, function(token) {
            res.json({token: token});
            callback();
          });
        }
      ], function(err, data) {
        if (err) return console.log(err);
      });
    });

    app.get('/signin', httpBasic, function(req, res) {
      async.waterfall([
        function findUser(callback) {
          users.findOne({
            username: req.auth.username
          }, callback)
        },
        function checkHash(user, callback) {
          debugger;
          if (!user) return callback(new Error('no such user'));
          bcrypt.compare(req.auth.password, user.password, callback);
        },
        function sendToken(correctPassword, callback) {
          if (!correctPassword) return callback(new Error('bad password'));
          jwt.sign({username: req.auth.username}, secret, null, function(token) {
            res.json({token: token});
            callback();
          });
        }
      ], function(err, data) {
        if (err) return res.status(401).send('bad login info');
      });
    });
  });
  return router;
};
