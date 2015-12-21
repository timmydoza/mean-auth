module.exports = function(users) {
  var checkRoles = function(arr1, arr2) {
    return arr1.some(function(role) {
      return arr2.indexOf(role) >= 0;
    });
   };
  return function(roles, callback) {

    //label for tests: admin only
    if (!roles) {
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

      //allow for a string input of one role rather than an array
    if (typeof roles === 'string') roles = [roles];

      // at this point roles must be an array. If not an array, don't proceed
    if (Array.isArray(roles !== true)) {
      console.log("no array of roles provided!");
      return res.json({msg: 'you need to pass in an string for a role or an array of roles'});
    }

    if (!callback) {
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

    // at this point, they should have passed in a callback function. Don't proceed if the parameter is not a function.
  if (typeof callback !== 'function') {
    console.log("callback function provided!");
    return res.json({msg: 'you need to pass in a callback function'});
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

