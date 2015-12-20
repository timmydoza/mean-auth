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

app.get('/somePath', bodyParser.json(), authenticat.tokenAuth, function(req, res) {
 // your callback stuff here
});

app.listen(port, function() {
  console.log('server up on port: ' + port);
});
```

#API Endpoints
##/signup
Takes a POST request to /signup.  This validates that the username is unique, creates a new user, and returns a token.

##/signin
 Uses http Basic authentication for sign-in. Takes a GET request to /signin. The password is hashed using bcrypt and checked against the hash stored in the database. If username is in the database (already signed up) and the password hash matches, then a token is returned.

#ToDos
- add to docs: more info for building a client.
    - what json post request payload looks like
    - token should be sent on GET requests in req.headers
    - describe json error messges
    -

- user roles
- password verification - password character set, length
- options for token expiration - have a default but allow for custom time
