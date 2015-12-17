
var httpBasic = require(__dirname + '/../lib/middleware/http_basic');
var expect = require('chai').expect;

describe('the httpBasic middleware', function() {
  it('should correcty decode a base64 http basic string', function() {
    var base64login = new Buffer('testuser:testpassword', 'utf8').toString('base64');
    var req = {
      headers: {
        authorization: 'Basic ' + base64login
      }
    };
    var cbCalled = false;
    httpBasic(req, null, function() {
      expect(req.auth).to.eql({
        username: 'testuser',
        password: 'testpassword'
      });
      cbCalled = true;
    });
    expect(cbCalled).to.eql(true);
  });
  it('should respond with an error if there is no auth info', function() {
    var sendCalled = false;
    var req = {
      headers: {}
    };
    var res = {
      status: function(code) {
        expect(code).to.eql(401);
        return this;
      },
      send: function(message) {
        expect(message).to.eql('Authentication invalid!');
        sendCalled = true;
      }
    };
    httpBasic(req, res, null);
    expect(sendCalled).to.eql(true);
  });
});
