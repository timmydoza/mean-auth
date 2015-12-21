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
      it('should call next() if user has role of "testrole"', function(done) {
        var req = {
          user: {
            username: 'testRoleUser'
          }
        };
        rolesAuth(['testrole'])(req, null, function() {
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
          json: function(message) {
            expect(message.msg).to.eql('not authorized');
            done();
          }
        };
        rolesAuth(['testrole'])(req, res);
      });
    });




    // describe('admin and roles')
    // describe('custom roles')
  });

});
