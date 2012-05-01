var gmail = require('../lib/gmail.js'),
    should = require('should'),
    fs = require('fs');


describe('A GMailInterface object',function() {
  var gm;
  before(function(done) {
    this.timeout(10000); // GMail can be a bit slow to respond
    fs.readFile('./test/test_settings.json',function(err,data) {
      var settings;
      should.not.exist(err);
      settings = JSON.parse(data);
      gm = Object.create(gmail.GMailInterface);
      gm.connect(settings.email,settings.password,function(err){
        should.not.exist(err);
        done();
      });
    });
  });
  it('can retrieve an email.',function(done) {
    this.timeout(10000);
    var fetcher = gm.apply_all();
    fetcher.once('fetched',function(message) {
      message.should.have.property('id');
      message.should.have.property('thread');
      message.should.have.property('date');
      message.should.have.property('labels');
      message.should.have.property('eml');
      done();
    })
  });
  /*
  after(function(done){
    gm.logout(done);
  });
  */
});
