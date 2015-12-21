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

app.get('/somePath', bodyParser.json(), authenticat.tokenAuth, authenticat.roleAuth, function(req, res) {
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

##Making someone an admin
There is no route to make an admin. The only way to add admin status to a user is to log into the database directly and manually add ```admin: true``` to the user object.


#Using The Middleware
##authenticat.tokenAuth


##authenticat.roleAuth


#ToDos
- add to docs: more info for building a client.
    - what json post request payload looks like
    - token should be sent on GET requests in req.headers
    - describe json error messges

- password verification - password character set, length
- options for token expiration - have a default but allow for custom time
