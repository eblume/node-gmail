var gmail = require('../lib/gmail.js'),
    vows = require('vows'),
    assert = require('assert');



vows.describe('Testing Environment').addBatch({
    'Arithmetic tests': {
      'when dividing a number by zero': {
        topic: function () { return 42 / 0 },

        'we get Infinity': function (topic) {
            assert.equal (topic, Infinity);
        }
      },
      'when dividing zero by zero': {
        topic: function () { return 0 / 0 },

        'we get a value which': {
            'is not a number': function (topic) {
                assert.isNaN (topic);
            },
            'is not equal to itself': function (topic) {
                assert.notEqual (topic, topic);
            }
        }
      }
    },
    'Module exports': {
      topic: gmail.gmail_test_variable,
      'are working as expected': function (result) {
        assert.equal(result,3);
      }
    }
}).export(module)

