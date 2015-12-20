var goToNext;
var badRole;

function checkRole(roles, role) {
  if (roles.indexOf(role) !== -1) {
    console.log(role)
    goToNext = true;
  }
  else {
    badRole = role;
    console.log(role + ' is not authorized on this route');
  }
};

module.exports =  function(roles, callback) {
  // if (!req.user).......
  if (!roles ||  Array.isArray(roles !== true)) {
    return function(req, res) {
      console.log("no array of roles provided!");
      res.json({msg: 'you need to pass in an array of roles'})
    };
  }
  if (!callback || typeof callback !== 'function') {
    return function(req, res) {
      console.log("callback function provided!");
      res.json({msg: 'you need to pass in a callback function'})
    };
  }
  return function(req, res, next) {
    callback(req, res, checkRole);
    process.nextTick(function(){
      if(goToNext) {
      next();
      } else {
      res.json({msg: 'authenticat says no ' + badRole + 's allowed!'})
      }
    })
  };
}
