var mongoose = require('mongoose');
var connection = mongoose.connect('mongodb://localhost/test_db');
var expect = require('chai').expect;
var User = require(__dirname + '/../lib/users');
var userObj = new User(connection);

describe('the user object with a mongoose connection object', function() {
  after(function(done) {
    userObj.db.dropDatabase(function() {
      done();
    });
  });
  describe('needs a user', function() {
    before(function(done) {
      userObj.users.insert({username: 'testuser'}, function(err, data) {
        debugger;
        done();
      });
    });
    describe('the userExists method', function() {
      it('should be able to check if a user is in the database', function(done) {
        userObj.userExists('testuser', function(err, data) {
          expect(data).to.eql(true);
          expect(err).to.eql(null);
          done();
        });
      });
      it('should be able to check if a user is not in the database', function(done) {
        userObj.userExists('anothertestuser', function(err, data) {
          expect(data).to.eql(false);
          expect(err).to.eql(null);
          done();
        });
      });
      describe('the addUser method', function() {
        it('should add a new user', function(done) {
          userObj.addUser('anothertestuser', 'password123', function(err, data) {
            expect(data.ops[0].username).to.eql('anothertestuser');
            expect(data.ops[0].password).to.not.eql(null);
            expect(err).to.eql(null);
            done();
          });
        });
        it('should return null if the user already exists', function(done) {
          userObj.addUser('anothertestuser', 'password123', function(err, data) {
            expect(data).to.eql(null);
            expect(err).to.eql(null);
            done();
          });
        });
      });
      describe('the checkHash method', function() {
        before(function(done) {
          userObj.addUser('kenny_loggins', 'danger_zone', function(err, data) {
            done();
          });
        });
        it('should return true if the password is correct', function(done) {
          userObj.checkHash('kenny_loggins', 'danger_zone', function(err, data) {
            expect(data).to.eql(true);
            expect(err).to.eql(null);
            done();
          });
        });
        it('should return false if the password is incorrect', function(done) {
          userObj.checkHash('kenny_loggins', 'safety_zone', function(err, data) {
            expect(data).to.eql(false);
            expect(err).to.eql(null);
            done();
          });
        });
      });
      describe('the getToken method', function() {
        it('should return a token', function(done) {
          userObj.getToken('username', function(err, token) {
            expect(token.token.split('.').length).to.eql(3);
            expect(err).to.eql(null);
            done();
          });
        });
      });
    });
  });
});
