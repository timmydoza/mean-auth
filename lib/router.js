var q = require('q');
var urlrouter = require('urlrouter');
var bodyParser = require('body-parser');
var httpBasic = require(__dirname + '/middleware/http_basic');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var async = require('async');

module.exports = function(instance) {
  var users = instance.connection.collection('users');
  var router = urlrouter(function(app) {
    app.post('/signup', bodyParser.json(), function(req, res) {
      async.waterfall([
        function hash(callback) {
          debugger;
          bcrypt.hash(req.body.password, 8, callback);
        },
        function save(hashedPassword, callback) {
          debugger;
          users.insert({
            username: req.body.username,
            password: hashedPassword
          }, callback);
        }, function test(arg1, callback) {
          res.json({test: 'yay'});
          callback(null, null);
        }

      ], function(err, data) {
        if (err) return console.log(err);
      });
    });

    app.get('/signin', httpBasic, function(req, res) {

    });
  });
  return router;
};
