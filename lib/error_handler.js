var errors = {};

errors['no username'] = function(res) {
  res.status(500).json({msg: 'no username'})
};
errors['no password'] = function(res) {
  res.status(500).json({msg: 'no password'})
};
errors['no add or remove'] = function(res) {
  res.status(500).json({msg:'PUT request must contain "add" or "remove" property'});
};
errors['username exists'] = function(res) {
  res.status(500).json({msg:'username already exists in database'});
};
errors['not authenticated'] = function(res) {
  res.status(401).json({msg:'username or password is incorrect'});
};

module.exports = function(error, res) {
  if (typeof error === 'string' && errors[error]) {
    errors[error](res);
  } else {
    res.status(500).json({msg: 'server error'});
  }
};
