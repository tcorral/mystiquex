var getRepoType = require('./lib/utils/getRepoType');
var resolvers = require('./lib/resolvers');
var Q = require('q');

var Mystiquex = function (){};
Mystiquex.prototype = {
    getResolver: function (src, decEndpoint){
        var deferred = Q.defer();
        if(!src || !decEndpoint){
            throw new Error('mystiquex needs the source url and ' +
                'the endpoint object to resolve the repo type.');
        }
        getRepoType(src, decEndpoint)
            .then(function (resolverName, decEndpoint){
                deferred.resolve(resolvers[resolverName], decEndpoint);
            })
            .fail(function (er){
                deferred.reject(er);
            });
        return deferred.promise;
    }
};

module.exports = new Mystiquex();