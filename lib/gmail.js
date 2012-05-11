// Imports
var ImapConnection = require('imap').ImapConnection,
    async = require('async'),
    EE = require('events').EventEmitter;

var gm = function() {};
exports.GMailInterface = gm;

// Object class: GMailInterface
// Methods:
//  * connect(username,password,callback) - connects to GMail
//  * logout(callback) - logs out of GMail
//  * apply_all(func) - Apply func to all emails in the account.

// GMailInterface.connect (username, password, callback)
// Create an active, asynchronous, read-only connection
// to the GMail server. 
// 
// The callback takes only one parameter - an error (or null if none)
gm.prototype.connect = function(username,password,callback) {
  var self = this; // stupid JS 'this' binding kludge.
  self.conn = new ImapConnection({
    username: username,
    password: password,
    host: 'imap.gmail.com',
    port: 993,
    secure: true
  });

  async.series([
    function(callback){self.conn.connect(callback); },
    function(callback){self.conn.openBox('[Gmail]/All Mail',true,callback);}
  ], callback);
};


// GMailInterface.logout (callback)
// Close the active connection to GMail, ending the asynch loop.
gm.prototype.logout = function(callback) {
  this.conn.logout(callback);
}

// Creates an email fetcher object that fetches the specified emails.
//
// The one argument is an object that filters the results. All resulting
// emails must match the specified criteria. Specifying no criteria produces
// all emails.
// 
// Currently supported criteria (please file a bug if you want more):
//  'id': the message header 'x-gm-msgid' must match this string.
//  'since': A date in the format of "26-Oct-2011 11:30:12 +0000"
//           (Actually other date formats probably work too - YMMV)
//  'uid_from': The message's UID must be greater than this number.
//
// The function will be given one argument, an object in the following form:
//  id:   The unique (and persistent) message ID
//  thread: The thread ID that this message belongs to (gmail thread id)
//  date: The date, eg. "20-Feb-2008 22:11:33 +0000"
//  labels: An array of GMail labels to which this email belongs.
//  uid: The IMAP "UID" of the mail, which is specific to the mailbox.
//  eml: The entire email in serialized form, ready to be written or parsed.
//
// Immediatly returns an event emitter with the following events:
//  'fetching'(ids,cancel) - Fired once before fetching begins, ids is a list
//                    of integers being fetched. These ids correspond to
//                    the IMAP message ID relative to the All Mails box, NOT
//                    to the GMail-specific IDs (returned as message.id).
//                    `cancel` is a callback which if called will abort the
//                    fetch, causing `end` to fire after the abort.
//  'fetched'(message) - the message was fetched - the entire message
//                       is returned, so you can also defer processing until
//                       this event occurs. In this case, you might choose
//                       to leave f (the applied function) as undefined.
//  'end' - All messages have been fetched and processed.
gm.prototype.get = function(query) {
  var self = this;
  var events = new EE();
  self.conn.search(make_search(query), function(err,ids) {
    if(err) {
      events.emit('error',err);
    }

    var should_abort = false;
    events.emit('fetching',ids, function() {should_abort = true;});

    if (should_abort) {
        events.emit('end');
    } else {
      var fetched = self.conn.fetch(ids,{
        markSeen: false,
        request: {
          struct: false,
          headers: false,
          body: "full"
        }
      });
      fetched.on('message',function(msg) {
        var message = {eml:""};
        msg.on('data',function(chunk) {
          message.eml += chunk.toString('binary');
        })
        msg.once('end',function(){
          message.id = msg['x-gm-msgid']; // unique across boxes, unlike msg.id
          message.thread = msg['x-gm-thrid'];
          message.date = msg.date;
          message.labels = msg['x-gm-labels'];
          message.uid = msg['id'];
          events.emit('fetched',message);
        });
      });

      fetched.once('end',function(){
        events.emit('end');
      });
    }
  });
  return events;
}

// Helper function to create a query string for imap.
var make_search = function(query) {
  if (!query || isEmpty(query)) {
    return ["ALL"]
  }

  // For now, we only support id. This will change.
  var criteria = [];

  for (var key in query) {
    var res;
    if (key == "id") {
      res = ['X-GM-MSGID',query.id];
    } else if (key == "since") {
      res = ['SINCE',query.since];
    } else if (key == "uid_from") {
      res = ['UID',query.uid_from+ ":*"];
    } else {
      throw "Unknown GMailInterface query: "+key+" => "+query[key];
    }
    criteria.splice(0,0,res);
  }
  return criteria;
}

var isEmpty = function(o) {
  for (var prop in o) {
    if (o.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}