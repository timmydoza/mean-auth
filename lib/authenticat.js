var Authenticat = module.exports = exports = function(connection, options) {
  this.connection = connection;
  this.options = options;
  this.router = require('./router')(this);
  this.middleware = require('./middleware')(this);

};
