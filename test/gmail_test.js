var gmail = require('../lib/gmail.js'),
    vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');



vows.describe('Basic interface tests').addBatch({

  'A GMailInterface object can': {
    topic: function() {
      var gm = Object.create(gmail.GMailInterface);
      var settings_file = 'test/test_settings.json';
      var settings = JSON.parse(fs.readFileSync(settings_file));
      var that = this;
      gm.connect(settings.email,settings.password,function() {
        that.callback(gm);
      });
    },

    'find an email' : {
      topic: function(gm) {
        console.log(">>>",gm);
      },


      'and read its body': function(email) {
        //
      },

      'and detect GMail labels': function(email) {
        //console.log(email);
      }
    }

  }
}).export(module)

