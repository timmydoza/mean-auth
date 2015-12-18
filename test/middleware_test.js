var expect = require('chai').expect;
var Users = require(__dirname + '/../lib/users');
var users = new Users('mongodb://localhost/test_db');
var middleware = require(__dirname + '/../lib/middleware')(users);
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
      middleware(req, null, function() {
        expect(req.user).to.eql('testuser');
        done();
      });
    });
  });
});
