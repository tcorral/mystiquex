var request = require('request');
var fs = require('fs');
request({ url: 'https://repo.backbase.com/us-packages/com/backbase/launchpad/0.11.7/launchpad-0.11.7.war',
    headers: { 'User-Agent': 'request' },
    auth:
    { user: 'tomas',
        pass: 'b4ckb4s3-t0m4s'} })
    .pipe(fs.createWriteStream('test/launchpad.war'));