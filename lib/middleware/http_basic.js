module.exports = function(req, res, next) {
  try {
    var auth = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString('utf8');
    req.auth = {
      username: auth.split(':')[0],
      password: auth.split(':')[1]
    };
    next();
  } catch(e) {
    console.log(e);
    res.status(401).send('Authentication invalid!');
  }
};
