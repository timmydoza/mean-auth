var mongodb = require('mongodb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
process.env.APP_SECRET = process.env.APP_SECRET || 'changemenow';

var UserObj = function(connection, options) {
  this.db = connection.connections[0].db;
  this.users = this.db.collection('users');
};

UserObj.prototype.userExists = function(username, callback) {
  this.users.findOne({username: username}, function(err, data) {
    if (err) {
      return callback(err);
    }
    if (!data) {
      callback(null, false);
    } else {
      callback(null, true);
    }
  });
};

UserObj.prototype.addUser = function(username, password, callback) {
  this.userExists(username, function(err, userFound) {
    if (err) {
      return callback(err);
    }
    if (!userFound) {
      bcrypt.hash(password, 8, function(err, hash) {
        if (err) {
          return callback(err);
        }
        this.users.insert({
          username: username,
          password: hash
        }, function(err, data) {
          if (err) {
            return callback(err);
          }
          callback(null, data);
        });
      }.bind(this));
    } else {
      callback(null, null);
    }
  }.bind(this));
};

UserObj.prototype.checkHash = function(username, password, callback) {
  this.users.findOne({username: username}, function(err, data) {
    if (err) {
      return callback(err);
    }
    bcrypt.compare(password, data.password, function(err, data) {
      if (err) {
        return callback(err);
      }
      callback(null, data);
    });
  });
};

UserObj.prototype.getToken = function(username, callback) {
  jwt.sign({username: username}, process.env.APP_SECRET, null, function(token) {
    callback(null, {token: token});
  });
};

module.exports = UserObj;
