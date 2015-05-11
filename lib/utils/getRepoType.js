var Q = require('q');
var path = require('path');
var fs = require('graceful-fs');

function checkGitRepo(source) {
    var deferred = Q.defer();
    if (/^git(\+(ssh|https?))?:\/\//i.test(source) || /\.git\/?$/i.test(source) || /^git@/i.test(source)) {
        deferred.resolve(true);
    }else{
        deferred.reject();
    }
    return deferred.promise;
}
function checkGitHubRepo(source){
    var deferred = Q.defer();
    var match;
    match = source.match(/(?:@|:\/\/)github.com[:\/]([^\/\s]+?)\/([^\/\s]+?)(?:\.git)?\/?$/i);
    if (match) {
        deferred.resolve(true);
    }else{
        deferred.reject();
    }
    return deferred.promise;
}
function checkSvnRepo(source) {
    var deferred = Q.defer();
    if (/^svn(\+(ssh|https?|file))?:\/\//i.test(source)) {
        deferred.resolve(true);
    }else{
        deferred.reject();
    }
    return deferred.promise;
}
function checkUrlRepo(source) {
    var deferred = Q.defer();
    if (/^https?:\/\//i.exec(source)) {
        deferred.resolve(true);
    }else{
        deferred.reject();
    }
    return deferred.promise;
}
function checkCVSFsRepo(source, directory) {
    var absolutePath = path.resolve(process.cwd(), source);
    var deferred = Q.defer();
    var fullPath = path.join(absolutePath, directory);
    fs.stat(fullPath, function (stats){
        deferred.notify(JSON.stringify(stats));
        try{
            if(stats.isDirectory()) {
                deferred.resolve(true);
            }else{
                deferred.reject();
            }
        }catch(er){
            fs.exists(fullPath, function (exists) {
                if(exists){
                    deferred.resolve(true);
                }else{
                    deferred.reject();
                }
            });
        }
    });

    return deferred.promise;
}
function checkGitFsRepo(source) {
    var deferred = Q.defer();
    checkCVSFsRepo(source, '.git')
        .progress(function (data){
            console.log(data);
        })
        .then(function (){
            deferred.resolve(true);
        })
        .fail(function (){
            deferred.reject();
        });
    return deferred.promise;
}
function checkSvnFsRepo(source) {
    var deferred = Q.defer();
    checkCVSFsRepo(source, '.svn')
        .progress(function (data) {
            console.log(data);
        })
        .then(function (){
            deferred.resolve(true);
        })
        .fail(function (){
            deferred.reject();
        });
    return deferred.promise;
}
function checkAbsolutePath(source){
    source = path.resolve(process.cwd(), source);
    var absolutePath = path.resolve(process.cwd(), source);
    var deferred = Q.defer();
    if (/^\.\.?[\/\\]/.test(source) || /^~\//.test(source) || path.normalize(source).replace(/[\/\\]+$/, '') === absolutePath) {
        deferred.resolve(true);
    }else{
        deferred.reject();
    }
    return deferred.promise;
}
function checkSimpleFsRepo(source) {
    var deferred = Q.defer();
    var absolutePath = path.resolve(process.cwd(), source);
    fs.stat(absolutePath, function (){
        deferred.resolve(true);
    });
    return deferred.promise;
}

function getRepoType(source, decEndpoint){
    var deferred = Q.defer();
    checkGitRepo(source)
        .progress(function (data) {
            console.log(data);
        })
        .then(function (){
            checkGitHubRepo(source)
                .progress(function (data) {
                    console.log(data);
                })
                .then(function (){
                    deferred.resolve({ name: 'GITHUB', endpoint: decEndpoint });
                })
                .fail(function (){
                    deferred.resolve({ name: 'GIT', endpoint: decEndpoint });
                });
        })
        .fail(function (){
            checkSvnRepo(source)
                .progress(function (data) {
                    console.log(data);
                })
                .then(function (){
                    deferred.resolve({ name: 'SVN', endpoint: decEndpoint });
                })
                .fail(function (){
                    checkUrlRepo(source)
                        .progress(function (data) {
                            console.log(data);
                        })
                        .then(function (){
                            deferred.resolve({ name: 'URL', endpoint: decEndpoint });
                        })
                        .fail(function (){
                            checkAbsolutePath(source)
                                .progress(function (data) {
                                    console.log(data);
                                })
                                .then(function (){
                                    checkGitFsRepo(source)
                                        .progress(function (data) {
                                            console.log(data);
                                        })
                                        .then(function (){
                                            deferred.resolve({ name: 'GIT-FS', endpoint: decEndpoint });
                                        })
                                        .fail(function (){
                                            checkSvnFsRepo(source)
                                                .progress(function (data) {
                                                    console.log(data);
                                                })
                                                .then(function (){
                                                    deferred.resolve({ name: 'SVN-FS', endpoint: decEndpoint });
                                                })
                                                .fail(function (){
                                                    checkSimpleFsRepo(source)
                                                        .progress(function (data) {
                                                            console.log(data);
                                                        })
                                                        .then(function (){
                                                            deferred.resolve({ name: 'FS', endpoint: decEndpoint });
                                                        });
                                                });
                                        });
                                })
                                .fail(function (){
                                    deferred.reject(new Error('Not an absolute or relative fail'))
                                });
                        });
                });
        });

    return deferred.promise;
}

module.exports = getRepoType;