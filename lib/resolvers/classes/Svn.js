var Base = require('./Base');
var Q = require('q');
var path = require('path');
var cmd = require('../../utils/cmd');
var which = require('which');
var hasSvn;

try{
    which.sync('svn');
    hasSvn = true
}catch(er){
    hasSvn = false;
}


var Svn = function (decEndpoint){
    if(decEndpoint){
        Base.call(this, decEndpoint);
        this.target = path.resolve(process.cwd(), this.target);
        if(!hasSvn){
            throw new Error('git is not installed or not in the PATH');
        }
    }
};
Svn.prototype = new Base();
Svn.prototype._checkout = function () {
    var deferred = Q.defer();
    console.log(this.source);
    cmd('svn', ['checkout', this.source])
        .then(function () {
            deferred.resolve();
        })
        .fail(function () {
            deferred.reject();
        });

    return deferred.promise;
};
Svn.prototype._update = function (){
    var deferred = Q.defer();
    console.log(this.source);
    cmd('svn', ['update'], { cwd: this.target })
        .then(function () {
            deferred.resolve();
        })
        .fail(function () {
            deferred.reject();
        });

    return deferred.promise;
};

module.exports = Svn;