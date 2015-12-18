var Authenticat = module.exports = exports = function(connection, options) {
  this.connection = connection;
  this.options = options;
  var UserObj = require(__dirname + '/users');
  var users = new UserObj(connection, options);
  this.router = require(__dirname + '/router')(users);
  this.middleware = require(__dirname + '/middleware')(this);
};
