gmail.js
========

*Convenient asynchronous read-only interface to GMail*

**IMPORTANT: This is a work in progress and will not function properly.**

by Erich Blume <blume.erich@gmail.com>

License
-------

This work is published under the following terms, commonly referred to as the
"MIT License", an OSI-certified open-source permissive license.

Copyright (c) 2012 Erich Blume

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Installation
------------

Coming soon - it should follow the standard `npm` routines, but I am new to `npm` and may have made mistakes.

Testing
-------

The testing suite for this library is a bit more complicated to set up then one would normally want, due to the fact that any tests that don't connect to a live GMail account are rather fragile. The following steps should make it easier, but unfortunately they are likely to break for people other than me at first. Input on this is welcome.

In order to set up the testing environment, first create (or have) a Google Mail (GMail.com) mail account. Then create a `test/test_settings.json` file in the format perscribed by `test/test_settings.json.example`.

Next, make sure you have a at least one recieved email. Additionally you need emails that (and these CAN be all just one email) have at least one attachment, and have at least one GMail label.

Once this is done, run `npm install` to create a module bundle in `./node_modules`, and then run `npm test` to run the test suites. They should all pass - if they do not, please file a bug!

Usage
-----

For now, check out the `test/` directory for usage examples. The API is extremely unstable right now, please do not rely on it being stable until further notice. As of this writing, the API is also exceedingly limited - it only allows you to asynchronously loop over every single email in your account. I am unlikely to add new functionality until people ask for it, as this is the only functionality I need for an application I am writing. I'll add more when I get to it, or much sooner if you ask for it. (I am likely to drop everything and help you if you ask, because that really excites me!)