var q = require('q');
var urlrouter = require('urlrouter');
var bodyParser = require('body-parser');
var httpBasic = require(__dirname + '/middleware/http_basic');

module.exports = function(instance) {

  var router = urlrouter(function(app) {
    app.post('/signup', bodyParser.json(), function(req, res) {

    });

    app.get('/signin', httpBasic, function(req, res) {

    });
  });
};
