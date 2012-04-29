// Delete this later on:
exports.gmail_test_variable = 3 // For testing the test framework



var ImapConnection = require('imap').ImapConnection,
  imap = new ImapConnection({
    // To people reading these old commits to the repo -
    // don't get your hopes up, this is an Application Specific
    // Password that will have been long-since deleted.
    username: 'blume.erich@gmail.com',
    password: 'daszhxulqnranaww',
    host: 'imap.gmail.com',
    port: 993,
    secure: true
  });


  imap.connect(function(error) {
    if (error) {
      console.log("Got an error: " + error);
      process.exit(1);
    }
    console.log("Made a connection.");
    imap.openBox('[Gmail]/All Mail',true, function(err,box) {
      if (error) {
        console.log("Got an error: " + error);
        process.exit(1);
      }
      console.log("Opened " + box.name + " with " + box.messages.total
        + " messages.");
      imap.search(["ALL"],function(error,msgids) {
        console.log("Processing " + msgids.length + " messages");
        fetch = imap.fetch(1,{
          'request': {
            'headers': true
          }
        });

        fetch.on("message", function(message) {
          console.log(message);
          console.log(message.headers);
          message.on("data", function(data) {
            console.log("Data: " + data);
          });
          message.on("end", function() {
            // Kill it all for now
            console.log("Finished message");
            process.exit(0);
          });
        });

        fetch.on("end", function() { process.exit(0); });
      })
    })
  })



