var mongodb = require('mongodb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
process.env.APP_SECRET = process.env.APP_SECRET || 'changemenow';

var checkRoles = function(arr1, arr2) {
  return arr1.some(function(role) {
    return arr2.indexOf(role) >= 0;
  });
};

var UserObj = function(connection, options) {
  this.db = connection.db;
  this.users = this.db.collection('users');
};

(function() {
  this.userExists = function(username, callback) {
    this.users.findOne({username: username}, function(err, data) {
      if (err) {
        return callback(err);
      }
      if (!data) {
        callback(null, false);
      } else {
        callback(null, data);
      }
    });
  };

  this.addUser = function(username, password, callback) {
    if (!username || username === '') {
      return callback('no username', null);
    }
    if (!password || password === '') {
      return callback('no password', null);
    }
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
            password: hash,
            roles: []
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

  this.checkHash = function(username, password, callback) {
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

  this.getToken = function(username, callback) {
    jwt.sign({username: username}, process.env.APP_SECRET, null, function(token) {
      callback(null, {token: token});
    });
  };

  this.isAdmin = function(username, callback) {
    this.users.findOne({username: username}, function(err, data) {
      if (err) {
        return callback(err);
      }
      if (!data.admin) {
        callback(null, false);
      } else {
        callback(null, true);
      }
    });
  };

  this.hasRole = function(username, roles, callback) {
    this.users.findOne({username: username}, function(err, data) {
      if (err) {
        return callback(err);
      }
      callback(null, (data.admin || checkRoles(data.roles, roles)));

    });
  };

  this.addRole = function(username, role, callback) {
    this.users.findOne({username: username}, function(err, data) {
      if (err) {
        return callback(err);
      }
      if (!role || role === '') return callback('no role provided');
      if (data.roles.indexOf(role) === -1) {
        data.roles.push(role);
      } else {
        return callback('already has role');
      }
      this.users.update({username: username}, {
        $set: {
          roles: data.roles
        }
      }, function(err, data) {
        if (err) {
          return callback(err);
        }
        callback(null, null);
      });
    }.bind(this));
  };

  this.removeRole = function(username, role, callback) {
    this.users.findOne({username: username}, function(err, data) {
      if (err) {
        return callback(err);
      }
      if (!role || role === '') return callback('no role provided');
      if (data.roles.indexOf(role) !== -1) {
        data.roles.splice(data.roles.indexOf(role), 1);
      } else {
        return callback('no role on user');
      }
      this.users.update({username: username}, {
        $set: {
          roles: data.roles
        }
      }, function(err, data) {
        if (err) {
          return callback(err);
        }
        callback(null, null);
      });
    }.bind(this));
  };
}).call(UserObj.prototype);

module.exports = UserObj;
