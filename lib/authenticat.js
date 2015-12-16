var Authenticat = module.exports = exports = function(connection, options) {
  this.connection = connection;
  this.options = options;
  this.router = require(__dirname + '/router')(this);
  this.middleware = require(__dirname + '/middleware')(this);
};
