var gmail = require('../lib/gmail.js'),
    should = require('should'),
    fs = require('fs');


describe('A GMailInterface object',function() {
  var gm;
  beforeEach(function(done) {
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
    fetcher.on('fetching',function(ids,cancel) {
      ids.length.should.equal(1);
      should.strictEqual(0,times_fetched);
    })
    fetcher.on('fetched',function(message) {
      times_fetched += 1;
      message.should.have.property('id');
      message.id.should.equal("1262008919301622338");
      message.should.have.property('thread');
      message.should.have.property('date');
      message.should.have.property('labels');
      message.should.have.property('eml');
      message.should.have.property('uid');
    });
    fetcher.on('end',function() {
      should.strictEqual(1,times_fetched);
      done();
    }); 
  });

  describe('using filter criteria to fetch emails', function() {
    it('can retrieve all emails after a certain date',function(done) {
      var fetcher = gm.get({since:"26-Oct-2011 11:30:12 +0000"});
      fetcher.on('fetching',function(ids,cancel) {
        ids.length.should.be.above(0);
        cancel();
      });
      fetcher.on('end',function() {
        done();
      })
    });
    it('can retrieve all emails after a certain UID', function(done) {
      var fetcher = gm.get({uid_from:69428});
      fetcher.on('fetching',function(ids,cancel) {
        ids[0].should.be.equal('69428');
        cancel();
      });
      fetcher.on('end',function() {
        done();
      })
    });
  });

  afterEach(function(done){
    gm.logout(done);
  });
});
