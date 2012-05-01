var gmail = require('../lib/gmail.js'),
    should = require('should'),
    fs = require('fs');


describe('The ./test/test_settings.json file', function() {
  var file = './test/test_settings.json';
  it('should exist',function(cb) {
    fs.stat(file,function(err,data) {
      should.not.exist(err);
      data.should.be.ok;
      cb();
    });
  });
  describe('contents', function() {
    var settings;
    before(function(cb) {
      fs.readFile(file,function(err,data) {
        should.not.exist(err);
        settings = JSON.parse(data);
        cb();
      });
    });
    it('should have an "email" field', function() {
      settings.should.have.property('email');
    });
    it('should have a "password" field', function() {
      settings.should.have.property('password');
    })
  });
});

