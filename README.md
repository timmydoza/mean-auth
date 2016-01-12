mean-auth
=====================
[![Build Status](https://travis-ci.org/craigaaroncampbell/authenticat.svg?branch=master)](https://travis-ci.org/authenticat/authenticat)

# About
Mean-auth is a simple drop-in library for adding token-based authentication and role-based authorization to a MEAN stack. It provides automated sign-in and sign-up routes through a router that can be mounted on your server.

# Setup
```npm install mean-auth```

# Usage
Simply drop the router into an Express server and provide it with a connection to a MongoDB database.
```
var app = require('express')();
var mongoose = require('mongoose');
var connection = mongoose.conncect('mongodb://localhost/user_db');
var MeanAuth = require('mean-auth');
var auth = new MeanAuth(connection);

app.use('/api', auth.router);

app.get('/secretpath', auth.tokenAuth, function(req, res) {
 // your code here
});

app.listen(3000, function() {
  console.log('server up on port 3000');
});
```

# API Endpoints
## /signup
Method: **POST**

The signup route can be used to create a new user in the database.  The password will be saved to the database as a hash.  The route accepts a username and password as JSON and returns a token using [JWT](https://jwt.io/).

Example (using superagent-cli and the server above):
```
superagent localhost:3000/api/signup post '{"username":"someUser", "password":"somePassword"}'
```
Response:

```{ token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRpbTEyMzQiLCJpYXQiOjE0NTA3NTk0NzN9.dvngcEuvntDp2t3fxGOlTZnAHxCCg_5CMxq-NaLnsFc' }```

**If the user name is taken, the response object will contain a value set to true that can be used on the client side to notify the user that the name has been taken.**  ```res.data.nameTaken: true```

## /signin
Method: **GET**

Uses [http basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) for sign-in. Returns a token if authentication is successful.

Example (using superagent-cli and the server above):
 ```
superagent localhost:3000/api/signin -u someUser:somePassword
 ```

## /roles
Method: **PUT**

This route can be used by an admin user to change another user's role(s).  **This route is only accessible by an admin.**  In the reqest body, send the following as JSON:
  - username: username of user whose role will be modified (string)
  - *one* of the following:
    - add: role to be added  (string)
    - remove: role to be removed (string)

Example (using superagent-cli and the server above):

```
superagent localhost:3000/api/roles put '{"token":"adminUserToken", username": "someUser", "add": "someNewRole"}
```


or

```
superagent localhost:3000/api/roles put '{"token":"adminUserToken", username": "someUser", "remove": "someRoleToRemove"}'
```

Alternatively, the token may be sent in the request headers.

# Admin Status
The only way to add admin status to a user is to log into the database directly and manually add ```admin: true``` to the user document. *There is no route to make someone an admin.* By default, users do not have an admin property (neither true nor false).


Example (using MongoDB):
```
db.users.update({usrname: 'someUser'}, {$set: {admin: true}})
```


# Using The Middleware
## auth.tokenAuth
Simply add this middleware into a route to ensure that only users with valid tokens may access the route. BodyParser is required if the token is sent in the request body.  It is recommended that the token should be sent with the response header.

```
app.get('/somePath', auth.tokenAuth, function(req, res) {
 // your code here
});
```


## auth.roleAuth()
The roleAuth middleware allows admins and users with specific roles to access the route. It *must* come after the tokenAuth middleware.

Simply add this middleware **after** authenticat.tokenAuth. **There are three ways to use roleAuth.** This is determined by the number of arguments passed to authenticat.roleAuth().

### 1. Routes only accessible by admins
If no arguments are passed to auth.roleAuth(), then the route will only accessible to admins.
```
app.get('/somePath', auth.tokenAuth, auth.roleAuth(), function(req, res) {
 // your code here
});
```

### 2. Routes accessible to admins and other specified roles
The first argument passed to auth.roleAuth() is either a string specifying a role or an array of strings which specify roles.  Users whose roles property includes at least one of the supplied roles will be allowed to access the route.

```
app.get('/somePath', auth.tokenAuth, auth.roleAuth('someRole'), function(req, res) {
 // your code
});
```
### 3. Custom role callback function
The second argument to auth.roleAuth() is a custom function. It must take three parameters:  req, res, and a function.

```
var customRoles = ['someRole', 'anotherRole'];

var customCallback = function(req, res, callback){
  // your code here
  var userRoles = ['someRole', 'differentRole'];
  callback(userRoles);
};
```
The roleAuth middleware will compare the roles specified as the first argument passed to roleAuth with the roles passed to the callback function above.  If any of the roles passed to the callback function match the roles provided to roleAuth, then the user is allowed to use the route.  This is useful for only allowing users who are owners on a specific resource.

Then your route might look like this:
```
app.get('/someRoute', auth.tokenAuth, auth.roleAuth(customRoles, customCallback), function(req, res) {
  // your code here
});
```

# ToDo:

- password verification - verify password character set and password length
- options for token expiration - have a default but allow for custom time limits
