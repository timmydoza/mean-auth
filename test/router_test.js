var chai = require('chai');
var chaihttp = require('chai-http');
chai.use(chaihttp);
var expect = chai.expect;
process.env.MONGO_URL = 'mongodb://localhost/signin_test';
require(__dirname + '/server/server.js');


describe('authentication routes - sign up', function() {

  afterEach('drop the database', function() {
    //insert code to drop the database
  });

  it('should be able to create a user', function(done) {
    chai.request('localhost:3000/api')
      .post('/signup')
      .send({username: 'testuser', password: '123'})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.body.token).to.have.length.above(0);
        done();
      });
  });

  before('create test user that will cause a "user already exists" error', function(done) {
    chai.request('localhost:3000/api')
      .post('/signup')
      .send({username: 'testuser', password: '123'})
      .end();
      done();
  });

  it('it should throw an error because user already exists', function(done) {
    chai.request('localhost:3000/api')
      .post('/signup')
      .send({username: 'testuser', password: '123'})
      .end(function(err, res) {
        expect(err).to.eql('User already exists');
        //or whatever it is the error should equal
        done();
      });
  });

  describe('authentication routes - sign in', function() {

    before('create a user for it to sign in to', function(done) {
      chai.request('locahost:3000/api')
        .post('/signup')
        .send({username: 'testuser2', password: '1234'})
        .end()
        done();
    })

    it('should be able to sign in to an existing user', function() {
      chai.request('localhost:3000/api')
        .get('/signin')
        .auth('testuser2', '1234')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.body.token).to.have.length.above(0);
          done();
        });
    });

    it('should be able to authenticate with a token');
  });
});




