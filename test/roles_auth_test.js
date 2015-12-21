var chai = require('chai');
var expect = chai.expect;
var mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost/test_db');
var Users = require(__dirname + '/../lib/users');
var users = new Users(connection);
var rolesAuth = require(__dirname + '/../lib/auth_roles')(users);

describe('the auth roles middleware', function() {
  after(function(done) {
    users.db.dropDatabase(function() {
      done();
    });
  });
  describe('needs a user', function() {
    before(function(done) {
      users.users.insert([{
        username: 'adminTrueUser',
        password: 'password123',
        admin: true
      }, {
        username: 'adminFalseUser',
        password: 'password456',
        admin: false
      }, {
        username: 'regularUser',
        password: 'password789'
      }, {
        username: 'testRoleUser',
        password: 'password321',
        roles: ['testrole']
      }, {
        username: 'otherRoleUser',
        password: 'password654',
        roles: ['other']
      }, {
        username: 'customRoleUser',
        password: 'password963',
        roles: ['customrole']
      }], function(err, data) {
        done();
      });
    });
    describe('admin only', function() {
      it('should call next() only if user is an admin', function(done) {
        var req = {
          user: {
            username: 'adminTrueUser'
          }
        };
        rolesAuth()(req, null, function() {
          done();
        });
      });
      it('should error if admin is false', function(done) {
        var req = {
          user: {
            username: 'adminFalseUser'
          }
        };
        var res = {
          status: function(code) {
            expect(code).to.eql(500);
            return this;
          },
          json: function(message) {
            expect(message.msg).to.eql('not authorized');
            done();
          }
        };
        rolesAuth()(req, res);
      });
      it('should error if admin property is not present', function(done) {
        var req = {
          user: {
            username: 'regularUser'
          }
        };
        var res = {
          status: function(code) {
            expect(code).to.eql(500);
            return this;
          },
          json: function(message) {
            expect(message.msg).to.eql('not authorized');
            done();
          }
        };
        rolesAuth()(req, res);
      });
    });
    describe('admin and roles', function() {
      it('should call next() if user is an admin', function(done) {
        var req = {
          user: {
            username: 'adminTrueUser'
          }
        };
        rolesAuth(['testrole'])(req, null, function() {
          done();
        });
      });
      it('should call next() if user has role in array of roles', function(done) {
        var req = {
          user: {
            username: 'testRoleUser'
          }
        };
        rolesAuth(['testrole'])(req, null, function() {
          done();
        });
      });
      it('should call next() if user has role in string', function(done) {
        var req = {
          user: {
            username: 'testRoleUser'
          }
        };
        rolesAuth('testrole')(req, null, function() {
          done();
        });
      });
      it('should error if not admin or "testrole"', function(done) {
        var req = {
          user: {
            username: 'otherRoleUser'
          }
        };
        var res = {
          status: function(code) {
            expect(code).to.eql(500);
            return this;
          },
          json: function(message) {
            expect(message.msg).to.eql('not authorized');
            done();
          }
        };
        rolesAuth(['testrole'])(req, res);
      });
    });
    describe('custom admin', function() {
      it('should call next() if user role from callback is array', function(done) {
        var req = {
          user: {
            username: 'adminFalseUser'
          }
        };
        var testFunction = function(req, res, callback) {
          callback(['customrole']);
        };
        var middleware =  rolesAuth(['customrole'], testFunction);
        middleware(req, null, function() {
          done();
        });
      });
      it('should call next() if user role from callback is string', function(done) {
        var req = {
          user: {
            username: 'adminFalseUser'
          }
        };
        var testFunction = function(req, res, callback) {
          callback('customrole');
        };
        var middleware =  rolesAuth(['customrole'], testFunction);
        middleware(req, null, function() {
          done();
        });
      });
      it('should call next() if user is admin', function(done) {
        var req = {
          user: {
            username: 'adminTrueUser'
          }
        };
        var testFunction = function(req, res, callback) {
          callback(['differentrole']);
        };
        var middleware =  rolesAuth(['customrole'], testFunction);
        middleware(req, null, function() {
          done();
        });
      });
      it('should not call next() if user role is not in provided array', function(done) {
        var req = {
          user: {
            username: 'adminFalseUser'
          }
        };
        var res = {
          status: function(code) {
            expect(code).to.eql(500);
            return this;
          },
          json: function(message) {
            expect(message.msg).to.eql('not authorized');
            done();
          }
        };
        var testFunction = function(req, res, callback) {
          callback(['differentrole']);
        };
        var middleware =  rolesAuth(['customrole'], testFunction);
        middleware(req, res, null);
      });
    });
  });
});
