var chai = require('chai');
var chaihttp = require('chai-http');
chai.use(chaihttp);
var expect = chai.expect;
process.env.MONGO_URL = 'mongodb://localhost/signin_test';
require(__dirname + '/server/server.js');


describe('authentication routes - sign up', function() {
  it('should be able to create a user', function(done) {
    chai.request('localhost:3000/api')
      .post('/signup')
      .send({username: 'testuser', password: '123'})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.body.token).to.have.length.above(0);
        done();
      })
  });

  it('should be able to error out correctly');

  describe('authentication routes - sign in', function() {
    it('should be able to sign in with a token');
  });
});




