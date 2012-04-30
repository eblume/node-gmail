var gmail = require('../lib/gmail.js'),
    vows = require('vows'),
    assert = require('assert'),
    fs = require('fs');



vows.describe('Validate the Testing Environment') .addBatch({
  'The test settings file (test/test_settings.json)': {
    topic: 'test/test_settings.json',

    'exists' : function (file) {
      assert.doesNotThrow(function() {
        fs.statSync(file);
      })
    },
    'has the fields': {
      topic: function(file) {return JSON.parse(fs.readFileSync(file)) },

      'email': function(settings) {assert.ok(settings.email); },
      'password': function(settings) {assert.ok(settings.password); }
    }
  }
}).export(module)

