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
      gm = new gmail.GMailInterface();
      gm.connect(settings.email,settings.password,function(err){
        should.not.exist(err);
        done();
      });
    });
  });
  it('can retrieve an email.',function(done) {
    this.timeout(10000);
    var fetcher = gm.get({id:"1262008919301622338"});
    var times_fetched = 0;
    fetcher.on('fetching',function(ids) {
      ids.length.should.equal(1);
    })
    fetcher.on('fetched',function(message) {
      times_fetched += 1;
      message.should.have.property('id');
      message.id.should.equal("1262008919301622338");
      message.should.have.property('thread');
      message.should.have.property('date');
      message.should.have.property('labels');
      message.should.have.property('eml');
    });
    fetcher.on('end',function() {
      should.strictEqual(1,times_fetched);
      done();
    }); 
  });
  after(function(done){
    gm.logout(done);
  });
});
