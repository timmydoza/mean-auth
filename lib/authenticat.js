var Authenticat = module.exports = exports = function(connection, options) {
  this.connection = connection;
  this.options = options;
  var UserObj = require(__dirname + '/users');
  var users = new UserObj(connection, options);
  this.router = require(__dirname + '/router')(users);
  this.tokenAuth = require(__dirname + '/token_auth')(users);
  this.roleAuth = require(__dirname + '/auth_roles')(users);
};
