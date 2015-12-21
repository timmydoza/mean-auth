module.exports = {
  add: function(users) {
    return function(req, res) {
      users.users.findOne({username: req.body.username}, function(err, user) {
        oldRoles = user.roles;
        //only push the new role in if it doesn't exist already
        if (oldRoles.indexOf(req.body.role) === -1) {
          oldRoles.push(req.body.role);
        } else {
          return res.json({msg: req.body.username + ' already had a role of ' + req.body.role})
        }

        users.users.update(
          {username: req.body.username},
          {
            $set: {
              roles: oldRoles
            }
          }
        );

        process.nextTick(function() {
          res.json({msg: 'added role of ' + req.body.role + ' to ' + req.body.username});
        });
      });
    };
  },

  remove: function(users){
    return function(req, res){
      users.users.findOne({username: req.body.username}, function(err, user) {
        oldRoles = user.roles;
        //make sure the role to remove actually exists first
        if (oldRoles.indexOf(req.body.role) !== -1) {
          oldRoles.splice(oldRoles.indexOf(req.body.role), 1);
        } else {
          return res.json({msg: req.body.username + ' did not have a role of ' + req.body.role });
        }

        users.users.update(
          {username: req.body.username},
          {
            $set: {
              roles: oldRoles
            }
          }
        );

        process.nextTick(function() {
          res.json({msg: 'removed role of ' + req.body.role + ' from ' + req.body.username});
        });
      });
    };
  }
};
