[![npm](https://img.shields.io/npm/l/mystiquex.svg)](https://www.npmjs.org/package/mystiquex)
[![npm](https://img.shields.io/npm/v/mystiquex.svg)](https://www.npmjs.org/package/mystiquex)
[![Build Status](https://travis-ci.org/tcorral/mystiquex.svg?branch=master)](https://travis-ci.org/tcorral/mystiquex)
[![Coverage Status](https://coveralls.io/repos/tcorral/mystiquex/badge.svg)](https://coveralls.io/r/tcorral/mystiquex)
[![Code Climate](https://codeclimate.com/github/tcorral/mystiquex/badges/gpa.svg)](https://codeclimate.com/github/tcorral/mystiquex)
[![Dependency Status](https://david-dm.org/tcorral/mystiquex.svg?theme=shields.io&style=flat)](https://david-dm.org/tcorral/mystiquex)
[![devDependency Status](https://david-dm.org/tcorral/mystiquex/dev-status.svg?theme=shields.io&style=flat)](https://david-dm.org/tcorral/mystiquex#info=devDependencies)


# mystiquex

Never use gitsubmodules anymore, mystiquex allows you to manage and download, if needed, all your repos whatever the endpoint is, it will reach the code for you, it also allows 
you to execute pre and post commands to complete the build of your projects at once.

## Installation

### Node 

Dependencies:

* node >= 0.10
* npm >= 2.0.0

```bash
npm install mystiquex --save
```

## Usage
==============

### getResolver
`mystiquex.getResolver` gets two arguments to be executed:

* `source {String}` is the endpoint where the source code exist, it could be a url or a local path.
* `decEndpoint {Object}` is the object with the information about the repository that we are managing.

`mystiquex.getResolver` returns an object with the resolver constructor class and the endpoint 

```javascript
var mystiquex = require('mystiquex');
var source = "https://github.com/user/reponame.git";
var decEndpoint = {
    "target/path/to/store/locally/your/repo" : source
};
mystiquex.getResolver(source, decEndpoint)
    .then(function (data){
        test.equal(data.resolver, resolvers.GITHUB);
        test.done();
    });
```
## Resolvers
==============

### How the resolvers work:
The resolvers are classes that extend from the Base.js resolver class.
Each resolver has a different resolution but they have the same public and consistent API.

### API of resolvers

#### resolver.createLink
Called when the install and the post commands are completely done. This method is a dummy function by
default but it should be overwritten in those resolvers that need to set a symlink.

##### Arguments:
* `callback {Function}` - callback to be executed after create the symlink.

##### Returns:
* `{Promise}`

#### resolver.checkout
Executes the pre-commands then checkouts the repo and after that it executes the post-commands.

##### Arguments:
* `callback {Function}` - callback to be executed after checkout the repo and execute all the commands.

##### Returns:
* `void`

#### resolver.update
Executes the pre-commands then updates the repo and after that it executes the post-commands.

##### Arguments:
* `callback {Function}` - callback to be executed after update the repo and execute all the commands.

##### Returns:
* `void`

#### resolver._checkout
Abstract function to be overwritten to implement the checkout of the repository.

##### Arguments:
* None

##### Returns:
* `{Promise}`

#### resolver._update
Abstract function to be overwritten to implement the update of the repository.

##### Arguments:
* None

##### Returns:
* `{Promise}`

#### resolver.install
This method checks if the folder exist or not and then it checks if it's needed to perform an update or a full checkout.
 
##### Arguments:
* `callback {Function}` - callback to be executed after the update or checkout has been done as well as the commands.

##### Returns:
* `void`

#### resolver.setCommandsLength
`resolver.setCommandsLength` gets one arguments to be executed:

* `length {Number}` is the number of all the commands to be executed in the complete build.

This function sets the length of commands so that the resolver can know when it has finished all the commands then even
if the last command is set as a detachable process it will be in hold until it is finished by the user.

#### resolver.setDetachedProcesses
It sets the commands that should be considered as detachable commands, so that when they are executed they will not 
stuck the parent process to execute other commands. i.e. Server commands, watching commands...

##### Arguments:
* `detachedProcesses {Array}` - commands that should be considered as detachable commands
  
##### Returns:
* `void`

#### resolver.setPrefixLog
It sets the prefix of the output and error log when it is needed to create a detached process.

##### Arguments:
* `prefix {String}` - prefix of the log that will be created the first time a detached process is called.

##### Returns:
* `void`

#### resolver.removeReports
It removes the output and error log created in case of any of the commands is a detached process.

##### Arguments:
* None

##### Returns:
* `void`

## Tests
==============

To run the tests with Jasmine:

```bash
npm install
npm test
```

## Contributing
==============

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Check that it still works: `npm test`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History
==============

0.0.12 - First working commit.

## License
==============

The MIT License (MIT)

Copyright (c) 2015 Tomás Corral

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.