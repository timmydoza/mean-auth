Authenticat!
=====================
All praise to the authenticat, keeper of secrets!
[![Build Status](https://travis-ci.org/craigaaroncampbell/authenticat.svg?branch=master)](https://travis-ci.org/craigaaroncampbell/authenticat)

![Authenticat](http://i.giphy.com/3oEduQAsYcJKQH2XsI.gif)

#About
Authenticat is a simple drop-in library for creating token-based authenticaiton. It provides automated sign-in and sign-up routes on a router that can be mounted on your server.  It assumes you are using an Express server and Mongo.

#Setup
```npm install authenticat```

#Usage
Simply drop the router into an Express server.
```
var app = require('express')();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Authenticat = require('authenticat');
var connection = mongoose.conncect('mongodb://localhost/whatever');
var authenticat = new Authenticat(connection);
var port = process.env.PORT || 3000;

app.use('/api', authenticat.router);

app.get('/somePath', bodyParser.json(), authenticat.tokenAuth, authenticat.roleAuth(), function(req, res) {
 // your callback stuff here
});

app.listen(port, function() {
  console.log('server up on port: ' + port);
});
```

#Using the Router
##/signup
Takes a POST request to /signup.  This validates that the username is unique, creates a new user, and returns a token.

##/signin
 Takes a GET request to /signin. Uses http Basic authentication for sign-in. The password is hashed using bcrypt and checked against the hash stored in the database. If username is in the database (already signed up) and the password hash matches, then a token is returned.

##/roles
Takes a PUT requst to change the roles of a given user.  **This route is only accessible by an admin.**  In the reqest body, send:
  - username: username of user whose role will be modified (string)
  - *one* of the following:
    - add: role to be added  (string)
    - remove: role to be removed (string)
  example:  ```'{"username": "someUser", "add": "someNewRole"}'```

#Admin Status
The only way to add admin status to a user is to log into the database directly and manually add ```admin: true``` to the user object. *There is no route to make someone admin.* By default, users do not have an admin property (neither true nor false).

**To remove admin status from an admin:** log into the database directly and set ```admin: false``` for that user.


#Using The Middleware
##authenticat.tokenAuth
Simply add this middleware text into a route to ensure a user has signed in to acess that route. This requires bodyParser if the token is sent in the request body.

```app.get('/somePath', bodyParser.json(), authenticat.tokenAuth, function(req, res) {
 // your callback stuff here
});```


##authenticat.roleAuth
*This middleware is optional* and allows only users with specific roles to acces the route. It *must* come after tokenAuth middleware.

Simply add this middleware **after** authenticat.tokenAuth. **There are three ways to use roleAuth.** This is determined by the number of arguments passed to authenticat.roleAuth().

###1. Routes only accessible by admins
If no arguments are passed to authenticat.roleAuth(), then the route will only accessible to admins.
```
app.get('/somePath', bodyParser.json(), authenticat.tokenAuth, authenticat.roleAuth(), function(req, res) {
 // your callback stuff here
});
```

###2.Routes accessible to admins, and other specified roles
The first argument passed to authenticat.roleAuth() is either a string specifying an acceptable role or an array strings that specify acceptable roles.  Users whose roles property does include at least one of these roles will not be allowed to access the route;

```
app.get('/somePath', bodyParser.json(), authenticat.tokenAuth, authenticat.roleAuth('someRole' | ['someRole', 'anotherRole']), function(req, res) {
 // your callback stuff here
});
```
###3.Custom role callback function
The second argument to authenticat.roleAuth() is a custom callback function. It must take three parametrs:  req, res, and a function.

```
var customRoles = ['someRole', 'anotherRole'];

var customCallback = function(req, res, checkAuthStatus){
  var userRoles;
  // custom method for determining userRoles and any other tasks you want to accomplish here.
  checkAuthStatus(userRoles);
};
```
Then your route might look like this:
```
app.get('/someRoute', bodyParser.json(), authenticat.tokenAuth, authenticat.roleAuth(customRoles, customCallback), function(req, res) {
  // your callback stuff here
});
```

#ToDos
- add to docs: more info for building a client.
    - what json post request payload looks like
    - token should be sent on GET requests in req.headers
    - describe json error messges

- password verification - password character set, length
- options for token expiration - have a default but allow for custom time
