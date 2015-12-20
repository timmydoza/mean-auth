var goToNext;
var badRole;

function checkRole(roles, role) {
  if (roles.indexOf(role) !== -1) {
    console.log(role);
    goToNext = true;
  }
  else {
    badRole = role;
    console.log(role + ' is not authorized on this route');
  }
}

module.exports = function(users) {
  return function(roles, callback) {
    if (!roles ||  Array.isArray(roles !== true)) {
      return function(req, res, next) {
        if(!req.user) {
          return res.json({msg: "you must use this middleware AFTER authenticat.tokenAuth!"});
        }
        users.isAdmin(req.user.username, function(err, admin) {
          if (admin === true) {
            next();
          } else {
            res.json({msg: "authenticat seyz admins only!"})
          }
        });
        // console.log("no array of roles provided!");
        // res.json({msg: 'you need to pass in an array of roles'});
      };
    }
    if (!callback || typeof callback !== 'function') {
      return function(req, res, next) {
        if(!req.user) {
          return res.json({msg: "you must use this middleware AFTER authenticat.tokenAuth!"});
        } else {
          users.hasRole(req.user.username, roles, function(err, correctRole){
            if (correctRole === true) {
              next();
            } else {
              res.json({msg: "authenticat seyz you gotta be admin or have the right role!"})
            }
          });
        }
        // console.log("callback function provided!");
        // res.json({msg: 'you need to pass in a callback function'});
      };
    }
    return function(req, res, next) {
      if(!req.user) {
        return res.json({msg: "you must use this middleware AFTER authenticat.tokenAuth!"});
      }
      callback(req, res, checkRole);
      process.nextTick(function(){
        if(goToNext) {
        next();
        } else {
        res.json({msg: 'authenticat says no ' + badRole + 's allowed!'});
        }
      });
    };
  };
};
