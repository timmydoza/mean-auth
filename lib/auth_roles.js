var goToNext;

function magicFunction(roles, role) {
  if (roles.indexOf(role) !== -1) {
    console.log(role)
    goToNext = true;
  }
  else {
    console.log(role + ' is not authorized on this route')
  }
};

module.exports =  function(roles, callback) {
  // if (!req.user).......
  // if (!roles.....)
  return function(req, res, next) {
    callback(req, res, magicFunction);
    process.nextTick(function(){
      if(goToNext) {
      next();
      } else {
      res.json({msg: 'authenticat says no!'})
      }
    })
  };
}
