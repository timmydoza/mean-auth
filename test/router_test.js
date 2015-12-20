var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost/test_db');
var Users = require(__dirname + '/../lib/users');
var users = new Users(connection);
var router = require(__dirname + '/../lib/router')(users);
var app = require('express')();
app.use('/', router);

chai.use(chaiHttp);


describe('the authenticat router', function() {
  after(function(done) {
    users.db.dropDatabase(function() {
      done();
    });
  });
  describe('needs a user', function() {
    before(function(done) {
      users.addUser('testuser123', 'password123', function(err, data) {
        done();
      });
    });
    describe('the signup route', function() {
      it('should return a token in response to a post request with username and password', function(done) {
        chai.request(app)
          .post('/signup')
          .send({username: 'testuser', password: 'password123'})
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('token');
            done();
          });
      });
      it('should return a message if the username is already taken', function(done) {
        chai.request(app)
          .post('/signup')
          .send({username: 'testuser123', password: 'password123'})
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res).to.have.status(401);
            expect(res.text).to.eql('server error');
            done();
          });
      });
      it('should return a message if bad data is sent', function(done) {
        chai.request(app)
          .post('/signup')
          .send({wrongproperty: 'bad data'})
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res).to.have.status(401);
            expect(res.text).to.eql('server error');
            done();
          });
      });
    });
    describe('the signin route', function() {
      it('should return a token if correct username and password are sent', function(done) {
        var base64login = new Buffer('testuser123:password123', 'utf8').toString('base64');
        chai.request(app)
          .get('/signin')
          .set('authorization', 'Basic ' + base64login)
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('token');
            done();
          });
      });
      it('should return an error if correct username and incorrect password are sent', function(done) {
        var base64login = new Buffer('testuser123:password', 'utf8').toString('base64');
        chai.request(app)
          .get('/signin')
          .set('authorization', 'Basic ' + base64login)
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res).to.have.status(401);
            expect(res.text).to.eql('bad login info');
            done();
          });
      });
      it('should return an error if an incorrect username and password are sent', function(done) {
        var base64login = new Buffer('baduser:password', 'utf8').toString('base64');
        chai.request(app)
          .get('/signin')
          .set('authorization', 'Basic ' + base64login)
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res).to.have.status(401);
            expect(res.text).to.eql('bad login info');
            done();
          });
      });
      it('should return an error if no http basic auth info is sent', function(done) {
        chai.request(app)
          .get('/signin')
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res).to.have.status(401);
            expect(res.text).to.eql('Authentication invalid!');
            done();
          });
      });
    });
  });
});
