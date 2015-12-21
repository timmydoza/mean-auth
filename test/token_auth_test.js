var expect = require('chai').expect;
var mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost/test_db');
var Users = require(__dirname + '/../lib/users');
var users = new Users(connection);
var tokenAuth = require(__dirname + '/../lib/token_auth')(users);
var jwt = require('jsonwebtoken');
process.env.APP_SECRET = 'testsecret';

describe('the jwt middleware', function() {
  after(function(done) {
    users.db.dropDatabase(function() {
      done();
    });
  });
  describe('needs a user', function() {
    before(function(done) {
      users.users.insert({username: 'testuser'}, function(err, data) {
        done();
      });
    });
    it('should call next() if the token is correctly verified', function(done) {
      var token = jwt.sign({username: 'testuser'}, process.env.APP_SECRET);
      var req = {
        headers: {
          token: token
        }
      };
      tokenAuth(req, null, function() {
        expect(req.user.username).to.eql('testuser');
        done();
      });
    });
    it('should respond with an error message if there is no token', function(done) {
      var req = {
        headers: {}
      };
      var res = {
        status: function(status) {
          expect(status).to.eql(401);
          return this;
        },
        json: function(message) {
          expect(message).to.eql({msg: 'Invalid Authentication'});
          done();
        }
      };
      tokenAuth(req, res, null);
    });
    it('should respond with an error if the token is not valid', function(done) {
      var token = jwt.sign({username: 'testuser'}, 'incorrectsecret');
      var req = {
        headers: {
          token: token
        }
      };
      var res = {
        status: function(status) {
          expect(status).to.eql(401);
          return this;
        },
        json: function(message) {
          expect(message).to.eql({msg: 'Invalid Authentication'});
          done();
        }
      };
      tokenAuth(req, res, null);
    });
    it('should respond with an error if the token is not valid', function(done) {
      var token = jwt.sign({username: 'adifferenttestuser'}, process.env.APP_SECRET);
      var req = {
        headers: {
          token: token
        }
      };
      var res = {
        status: function(status) {
          expect(status).to.eql(401);
          return this;
        },
        json: function(message) {
          expect(message).to.eql({msg: 'Invalid Authentication'});
          done();
        }
      };
      tokenAuth(req, res, null);
    });
  });
});
