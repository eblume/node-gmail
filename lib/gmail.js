// Imports
var ImapConnection = require('imap').ImapConnection,
    async = require('async'),
    EE = require('events').EventEmitter;

var gm = {};
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
gm.connect = function(username,password,cb) {
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
  ],
  function(err,results) {
    process.nextTick(function(err){return cb(err);});
  });
};


// GMailInterface.logout (callback)
// Close the active connection to GMail, ending the asynch loop.
gm.logout = function(callback) {
  var self = this; // stupid JS 'this' binding kludge.
  self.conn.logout(function() {
    self.conn = null;
    process.nextTick(callback);
  });
}

// Applys the given functon to every single email in the GMail account.
// The function will be given one argument, an object in the following form:
//  id:   The unique (and persistent) message ID
//  thread: The thread ID that this message belongs to (gmail thread id)
//  date: The date, eg. "20-Feb-2008 22:11:33 +0000"
//  labels: An array of GMail labels to which this email belongs.
//  headers: The entire header as returned by the imap library.
//  eml: The entire email in serialized form, ready to be written or parsed.
//
// Immediatly returns an event emitter with the following events:
//  'fetched'(message) - the message was fetched - the entire message
//                       is returned, so you can also defer processing until
//                       this event occurs. In this case, you might choose
//                       to leave f (the applied function) as undefined.
//  'processed'(message) - as above, but now it has been processed too.
//  'end' - All messages have been fetched and processed.
gm.apply_all = function(f) {
  var self = this; // Stupid JS 'this' binding kludge.
      events = new EE();
  self.conn.search(['ALL'], function(err,ids) {
    if(err) {
      console.log("Fatal error: ",err);
      process.exit(1);
    }
    var fetched = conn.fetch(ids,{
      markSeen: false,
      request: {
        struct: false,
        headers: false,
        body: "all"
      }
    });
    fetched.on('message',function(msg) {
      var message = {
        id: msg['x-gm-msgid'], // unique across boxes, unlike msg.id
        thread: msg['x-gm-thrid'],
        date: msg.date,
        labels: msg['x-gm-labels'],
        headers: msg.headers,
        eml: ""
      };
      msg.on('data',function(chunk) {
        // This line makes me queasy but I don't know better yet.
        message.eml = message.eml + chunk.toString();
      })
      msg.once('end',function(){
        events.emit('fetched',message);
        if (typeof f == 'function') {
          process.nextTick(function() {
            f(message);
            events.emit('processed',message);
          });
        }
      });
    });

    fetched.once('end',function(){
      events.emit('end');
    });
  });
  return events;
}
