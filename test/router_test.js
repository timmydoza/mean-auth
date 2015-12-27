var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost/test_db');
var Users = require(__dirname + '/../lib/users');
var users = new Users(connection);
var router = require(__dirname + '/../lib/router')(users);
var app = require('express')();
var jwt = require('jsonwebtoken');
process.env.APP_SECRET = 'testsecret';
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
        users.users.insert([{
          username: 'adminUser',
          password: 'password123',
          admin: true
        }, {
          username: 'rolesUser',
          password: 'doesntmatter',
          roles: ['removeme', 'anotherrole']
        }], function(err, data) {
          done();
        });
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
            expect(res).to.have.status(500);
            expect(res.body.msg).to.eql('username already exists in database');
            expect(res.body.nameTaken).to.eql(true);
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
            expect(res.body.msg).to.eql('username or password is incorrect');
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
            expect(res.body.msg).to.eql('username or password is incorrect');
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
      describe('the roles route', function() {
        it('should not be accessible by non admins', function(done) {
          var testToken = jwt.sign({username: 'testuser123'}, process.env.APP_SECRET);
          chai.request(app)
            .put('/roles')
            .set('token', testToken)
            .send({username: 'testuser123', add: 'something'})
            .end(function(err, res) {
              expect(err).to.eql(null);
              expect(res.body.msg).to.eql('not authorized');
              done();
            });
        });
        it('should be accessible by admins and should add role if it doesnt already exist', function(done) {
          var testToken = jwt.sign({username: 'adminUser'}, process.env.APP_SECRET);
          chai.request(app)
            .put('/roles')
            .set('token', testToken)
            .send({username: 'testuser123', add: 'something'})
            .end(function(err, res) {
              expect(err).to.eql(null);
              expect(res.body.msg).to.eql('added role of something to testuser123');
              users.users.findOne({username: 'testuser123'}, function(err, data) {
                expect(data.roles).to.eql(['something']);
                done();
              });
            });
        });
        it('should be accessible by admins and should remove role that exists', function(done) {
          var testToken = jwt.sign({username: 'adminUser'}, process.env.APP_SECRET);
          chai.request(app)
            .put('/roles')
            .set('token', testToken)
            .send({username: 'rolesUser', remove: 'removeme'})
            .end(function(err, res) {
              expect(err).to.eql(null);
              expect(res.body.msg).to.eql('removed role of removeme from rolesUser');
              users.users.findOne({username: 'rolesUser'}, function(err, data) {
                expect(data.roles).to.eql(['anotherrole']);
                done();
              });
            });
        });
        it('should be accessible by admins and error if role already exists on add', function(done) {
          var testToken = jwt.sign({username: 'adminUser'}, process.env.APP_SECRET);
          chai.request(app)
            .put('/roles')
            .set('token', testToken)
            .send({username: 'rolesUser', add: 'anotherrole'})
            .end(function(err, res) {
              expect(err).to.eql(null);
              expect(res.body.msg).to.eql('the user already has that role');
              done();
            });
        });
        it('should be accessible by admins and error if role does not exist on remove', function(done) {
          var testToken = jwt.sign({username: 'adminUser'}, process.env.APP_SECRET);
          chai.request(app)
            .put('/roles')
            .set('token', testToken)
            .send({username: 'rolesUser', remove: 'nonexistantrole'})
            .end(function(err, res) {
              expect(err).to.eql(null);
              expect(res.body.msg).to.eql('the user does not have that role');
              done();
            });
        });
        it('should return an error if admin does not provide add or remove property', function(done) {
          var testToken = jwt.sign({username: 'adminUser'}, process.env.APP_SECRET);
          chai.request(app)
            .put('/roles')
            .set('token', testToken)
            .send({username: 'rolesUser', remove: ''})
            .end(function(err, res) {
              expect(err).to.eql(null);
              expect(res.body.msg).to.eql('PUT request must contain "add" or "remove" property');
              done();
            });
        });
      });
    });
  });
});
