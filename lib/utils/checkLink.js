var Q = require('q');
var fs = require('graceful-fs');

function validLink(file) {
    // Ensures that a file is a symlink that points
    // to a valid file
    return Q.nfcall(fs.lstat, file)
        .progress(function (data) {
            console.log(data);
        })
        .then(function (lstat) {
            if (!lstat.isSymbolicLink()) {
                return [false];
            }

            return Q.nfcall(fs.stat, file)
                .then(function (stat) {
                    return [stat];
                });
        })
        .fail(function (err) {
            return [false, err];
        });
}

module.exports = validLink;