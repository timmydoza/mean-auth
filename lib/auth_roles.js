module.exports = function(users) {
  var checkRoles = function(arr1, arr2) {
    return arr1.some(function(role) {
      return arr2.indexOf(role) >= 0;
    });
   };
  return function(roles, callback) {
    if (typeof roles === 'string') roles = [roles];
    //label for tests: admin only
    if (!roles ||  Array.isArray(roles !== true)) {
      return function(req, res, next) {
        if (!req.user) {
          return res.json({msg: 'you must use this middleware AFTER authenticat.tokenAuth!'});
        }
        users.isAdmin(req.user.username, function(err, admin) {
          if (admin === true) {
            next();
          } else {
            res.json({msg: 'not authorized'});
          }
        });
      };
    }
    if (!callback || typeof callback !== 'function') {
      //label for tests: admin and roles
      return function(req, res, next) {
        if (!req.user) {
          return res.json({msg: 'you must use this middleware AFTER authenticat.tokenAuth!'});
        } else {
          users.hasRole(req.user.username, roles, function(err, correctRole) {
            if (correctRole === true) {
              next();
            } else {
              res.json({msg: 'not authorized'});
            }
          });
        }
      };
    }
    return function(req, res, next) {
      //label for tests: custom roles
      if (!req.user) {
        return res.json({msg: 'you must use this middleware AFTER authenticat.tokenAuth!'});
      }
      callback(req, res, function(roleArray) {
        if (typeof roleArray === 'string') roleArray = [roleArray];
        users.isAdmin(req.user.username, function(err, admin) {
          if (admin || checkRoles(roles, roleArray)) {
            next();
          } else {
            res.json({msg: 'not authorized'});
          }
        });
      });

    };
  };
};
