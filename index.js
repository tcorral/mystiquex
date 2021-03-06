var getRepoType = require('./lib/utils/getRepoType');
var resolvers = require('./lib/resolvers');
var Q = require('q');
var killOnExit = require('./lib/utils/killOnExit');
killOnExit.startHandlers();

var Mystiquex = function (){};
Mystiquex.prototype = {
    getResolver: function (src, decEndpoint){
        var deferred = Q.defer();
        if(!src || !decEndpoint){
            throw new Error('mystiquex needs the source url and ' +
                'the endpoint object to resolve the repo type.');
        }
        getRepoType(src, decEndpoint)
            .then(function (data){
                deferred.resolve({
                    resolver: resolvers[data.name],
                    endpoint: data.endpoint
                });
            })
            .fail(function (er){
                deferred.reject(er);
            });
        return deferred.promise;
    }
};

module.exports = new Mystiquex();