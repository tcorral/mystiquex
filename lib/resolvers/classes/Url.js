var Base = require('./Base');
var Q = require('q');
var path = require('path');
var temp = require('temp');
var request = require('request');
var fs = require('graceful-fs');
var extract = require('../../utils/extract');
var mvnCredentials = require('mvn-credentials');

temp.track();

function Url(decEndpoint) {
    Base.call(this, decEndpoint);
    this.testAuth = decEndpoint.testAuth || null;
    this.target = path.resolve(process.cwd(), this.target);
}
Url.prototype = new Base();

Url.prototype.requiresAuth = function (){
    return typeof this.testAuth === 'string' && this.source.indexOf(this.testAuth) !== -1;
};
Url.prototype._createTempDir = function (url) {
    var deferred = Q.defer();
    temp.mkdir('storage', function (err, dirPath) {
        if (err) {
            return deferred.reject(err);
        }
        deferred.resolve({
            dirPath: dirPath,
            url: url
        });
    });
    return deferred.promise;
};
Url.prototype._request = function (options, file, deferred){
    request(options)
        .pipe(fs.createWriteStream(file))
        .on('error', function (er){
            console.log(er);
            deferred.reject(er);
        })
        .on('close', function () {
            deferred.resolve(file);
        });
};
Url.prototype._download = function (data) {
    var deferred = Q.defer();
    var self = this;
    var options = {
        url: data.url,
        headers: {
            'User-Agent': 'request'
        }
    };
    var mimetype = data.url.indexOf('.tar.gz') !== -1 ? '.tar.gz' : path.extname(data.url);
    var file = path.join(data.dirPath, 'archive' + (mimetype === '.war' ? '.zip' : mimetype) );

    if (this.requiresAuth()) {
        mvnCredentials.fetch()
            .then(function (credentials){
                options.auth = {
                    'user': credentials.username,
                    'pass': credentials.password
                };
                self._request(options, file, deferred);
            });
    }else{
        this._request(options, file, deferred);
    }

    return deferred.promise;
};
Url.prototype._checkout = function () {
    var deferred = Q.defer();
    var self = this;
    this._createTempDir(this.source)
        .then(function (data) {
            self._download(data)
                .progress(function (data) {
                    console.log(data);
                })
                .then(function (file) {
                    extract(file, self.target)
                        .progress(function (data) {
                            console.log(data);
                        })
                        .then(function () {
                            deferred.resolve();
                        })
                        .fail(function (err) {
                            deferred.reject(err);
                        });
                })
                .fail(function (err) {
                    deferred.reject(err);
                });
        });
    return deferred.promise;
};
Url.prototype._update = Url.prototype._checkout;
module.exports = Url;