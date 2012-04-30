// Imports
var ImapConnection = require('imap').ImapConnection,
    async = require('async'),
    EE = require('events').EventEmitter;

exports.GMailInterface = Object.create(EE);
var gm = exports.GMailInterface;

var die = function(err) {
  console.log("Fatal Error: " + err);
  throw {
    name: 'GMailConnectionError',
    message: 'Fatal Error: ' + err
  };
};

// Object class: GMailInterface
// Methods:
//  * connect(username,password) - connects to GMail
//  * logout() - logs out of GMail
//  * apply_all(func) - Apply func to all emails in the account.
// Events:
//  * 'connected' - The connect() call has successfully connected.
//  * 'end' - The logout() call has successfully logged out.

// GMailInterface.connect (username, password)
// Create an active, asynchronous, read-only connection
// to the GMail server. 
gm.connect = function(username,password) {
  var self = this; // stupid JS 'this' binding kludge.
  self.conn = new ImapConnection({
    username: username,
    password: password,
    host: 'imap.gmail.com',
    port: 993,
    secure: true
  });
  self.conn.connect(die);
  self.conn.openBox('[Gmail]/All Mail',true,function(err,box) {
    if (err) {
      die(err);
    }
    self.emit('connected');
  });
};


// GMailInterface.logout ()
// Close the active connection to GMail, ending the asynch loop.
gm.logout = function() {
  var self = this; // stupid JS 'this' binding kludge.
  self.conn.logout(function() {
    self.conn = null;
    self.removeAllListeners('connected');
    self.emit('end');
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
//  'fetched'(message_id) - the message with id 'message_id' was fetched.
//                          This event is emitted immediatly prior to
//                          function application.
//  'end' - All messages have been fetched and processed.
gm.apply_all = function(f) {
  var self = this; // Stupid JS 'this' binding kludge.
      events = new EE();
  self.conn.search(['ALL'], function(err,ids) {
    if(err) {
      die(err);
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
        events.emit('fetched',message.id);
        // I feel like this line is not robust enough...
        f(message);
      });
    });

    fetched.once('end',function(){
      events.emit('end');
    });
  });
  return events;
}
