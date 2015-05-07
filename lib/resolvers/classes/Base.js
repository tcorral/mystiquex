var validLink = require('../../utils/checkLink');
var Q = require('q');
var async = require('async');
var fs = require('graceful-fs');
var cmd = require('../../utils/cmd');
var path = require('path');
var killOnExit = {
    processes: []
};
var executions = 0;

require('../../utils/safe-exit')(killOnExit);

var executeCommands = function (instance, type){
    var deferred = Q.defer();
    var commands = instance[type + 'Commands'] || [];
    var cwd;

    async.eachSeries(commands, function (command, callback){
        executions++;
        var commandParts = command.split(' ');
        var mainCommand = commandParts.shift();
        var options;
        if(command.indexOf('cd ') === 0){
            cwd = commandParts[0];
            return callback();
        }
        if(cwd){
            options = {
                cwd: cwd
            };
        }
        if(instance.detachedProcesses.length && instance.detachedProcesses.indexOf(command) !== -1 && executions < instance.commandsLength){
            options = options || {};
            options.detached = true;
            options.prefixLog = instance.prefixLog;
        }else if(instance.commandsLength === executions){
            options.last = true;
        }
        console.log(options);
        cmd(mainCommand, commandParts, options)
            .progress(function (data) {
                if(typeof data === 'object' && data.detached){
                    killOnExit.processes.push(data.detached);
                }else{
                    deferred.notify(data);
                }
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
        this.detachedProcesses = [];
        this.prefixLog = 'mystiquex';
        this.commandsLength = 0;
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
    setCommandsLength: function (length){
        this.commandsLength = length;
    },
    setPrefixLog: function (prefix){
        this.prefixLog = prefix;
    },
    setDetachedProcesses: function (detachedProcesses) {
        this.detachedProcesses = detachedProcesses;
    },
    removeReports: function (){
        var cwd = process.cwd();
        try{
            var statsOut = fs.statSync(path.join(cwd, this.prefixLog + '-out.log'));
            var statsError = fs.statSync(path.join(cwd, this.prefixLog + '-out.log'));
            if(statsOut.isFile()){
                fs.unlinkSync(path.join(cwd, this.prefixLog + '-out.log'));
            }
            if(statsError.isFile()) {
                fs.unlinkSync(path.join(cwd, this.prefixLog + '-err.log'));
            }
        }catch(er){}
    },
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
            .progress(function (data) {
                console.log(data);
            })
            .then(function (){
                self._update()
                    .then(function (){
                        executeCommands(self, 'post')
                            .progress(function (data) {
                                console.log(data);
                            })
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