var jwt = require('jsonwebtoken');

module.exports = function(users) {
  return function(req, res, next) {
    var token = req.headers.token;
    var bodyToken = (req.body) ? req.body.token : '';
    token = token || bodyToken;
    if (!token) {
      console.log('no token supplied in http request');
      return res.status(401).json({msg: 'Invalid Authentication'});
    }
    jwt.verify(token, process.env.APP_SECRET, function(err, decoded) {
      if (err) {
        console.log(err);
        return res.status(401).json({msg: 'Invalid Authentication'});
      }
      users.userExists(decoded.username, function(err, userFound) {
        if (err) {
          console.log(err);
          return res.status(401).json({msg: 'Invalid Authentication'});
        }
        if (!userFound) {
          console.log('user not found');
          return res.status(401).json({msg: 'Invalid Authentication'});
        }
        req.user = userFound;
        next();
      });
    });
  };
};
