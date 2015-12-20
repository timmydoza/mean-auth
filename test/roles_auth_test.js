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
      users.users.insert([{username: 'testuser123', password: 'password123', admin: true}, {username: 'testuser456', password: 'password456', admin: false}, {username: 'testuser789', password: 'password789'}], function(err, data) {
        done();
      });
    });
    describe('admin only', function() {
      it('should call next() only if user is an admin', function(done) {
        var req = {
          user: {
            username: "testuser123"
          }
        };
        rolesAuth()(req, null, function() {
          done();
        });
      });
      it('should error if admin is false', function(done) {
        var req = {
          user: {
            username: "testuser123"
          }
        };
        var res = {
          json: function(message) {
            expect(message.msg).to.eql('not authorized');
            done();
          }
        };
      });
      it('should error if admin property is not present');
    });




    // describe('admin and roles')
    // describe('custom roles')
  });

});

