var validLink = require('../../utils/checkLink');
var Q = require('q');
var async = require('async');
var cmd = require('../../utils/cmd');
var path = require('path');

var executeCommands = function (instance, type){
    var deferred = Q.defer();
    var commands = instance[type + 'Commands'] || [];

    async.eachSeries(commands, function (command, callback){
        var commandParts = command.split(' ');
        var mainCommand = commandParts.shift();
        cmd(mainCommand, commandParts)
            .progress(function (data) {
                deferred.notify(data);
            })
            .then(function (stdout, stderr){
                callback();
            })
            .fail(function (err){
                callback(err);
            });
    }, function (){
        deferred.resolve();
    });

    if(!commands){
        deferred.resolve();
    }
    return deferred.promise;
};

var Base = function (decEndpoint){
    if(decEndpoint){
        var commands = decEndpoint.commands;
        this.source = decEndpoint.source;
        this.target = decEndpoint.target;
        this.cwd = decEndpoint.cwd;
        this.preCommands = [];
        this.postCommands = [];
        if(commands){
            this.preCommands = commands.pre || [];
            this.postCommands = commands.post || commands;
        }
    }
};
Base.prototype = {
    createLink: function (callback){
        var deferred = Q.defer();
        var promise = deferred.promise;
        promise.then(function (){
            callback();
        });
        deferred.resolve();
        return promise;
    },
    checkout: function (callback){
        var self = this;
        executeCommands(this, 'pre')
            .progress(function (data) {
                console.log(data);
            })
            .then(function (){
                self._checkout()
                    .then(function (){
                        executeCommands(self, 'post')
                            .progress(function (data) {
                                console.log(data);
                            })
                            .then(function (){
                                self.createLink(callback);
                            });
                    });
            });
    },
    update: function (callback) {
        var self = this;
        executeCommands(this, 'pre')
            .then(function (){
                self._update()
                    .then(function (){
                        executeCommands(self, 'post')
                            .then(function (){
                                callback();
                            });
                    });
            });
    },
    _checkout: function (){
        throw new Error('Checkout method should be implemented.');
    },
    _update: function (){
        throw new Error('Update method should be implemented.');
    },
    install: function (callback){
        var self = this;
        return validLink(this.target)
            .then(function (result){
                if(result[0] === false){
                    self.checkout(callback);
                }else{
                    self.update(callback);
                }
            });
    }
};

module.exports = Base;