'use strict';

var resolvers = require('../lib/resolvers');
var path = require('path');
var fs = require('fs');
var mystiquex = require('../');
var mkdirp = require('mkdirp');

exports.mystiquex = {
    noConfig: function (test) {
        test.throws(function (){
            mystiquex.getResolver();
        });
        test.done();
    },
    FsRepo: function (test) {
        var source = "test/expected/installAllRepos/repos/airbnb/javascript";
        var decEndpoint = {
            "test/generated/repos/airbnb/javascript": source
        };
        mystiquex.getResolver(source, decEndpoint)
            .then(function (data){
                test.equal(data.resolver, resolvers.FS);
                test.done();
            });
    },
    SvnFsRepo: function (test){
        var source = 'test/expected/svn-test';
        var decEndpoint = {
            "test/generated/repos/tcorral/svn-test" : source
        };
        var absolutePath = path.join(process.cwd(), source, '.svn');
        mkdirp(absolutePath, function (){
            mystiquex.getResolver(source, decEndpoint)
                .then(function (data){
                    test.equal(data.resolver, resolvers['SVN-FS']);
                    test.done();
                });
        });

    },
    GitFsRepo: function (test){
        var source = 'test/expected/git-test';
        var decEndpoint = {
            "test/generated/repos/tcorral/svn-test" : source
        };
        var absolutePath = path.join(process.cwd(), source, '.git');
        mkdirp(absolutePath, function (){
            mystiquex.getResolver(source, decEndpoint)
                .then(function (data){
                    test.equal(data.resolver, resolvers['GIT-FS']);
                    test.done();
                });
        });
    },
    GitRepo: function (test) {
        var source = "git@bitbucket.org:tcorral/coffeescript-syntax-definition.git";
        var decEndpoint = {
            "test/generated/repos/tcorral/coffee" : source
        };
        mystiquex.getResolver(source, decEndpoint)
            .then(function (data){
                test.equal(data.resolver, resolvers.GIT);
                test.done();
            });
    },
    SvnRepo: function (test) {
        var source = "svn://localhost/repo";
        var decEndpoint = {
            "test/generated/repos/tcorral/svn-repo" : source
        };
        mystiquex.getResolver(source, decEndpoint)
            .then(function (data){
                test.equal(data.resolver, resolvers.SVN);
                test.done();
            });

    },
    AuthRepo: function (test) {
        var source = process.env.AUTH_REPO;
        var endpoint = { source: source, target: "test/generated/repos/tcorral/auth-repo", "testAuth": process.env.REGEX_AUTH };
        mystiquex.getResolver(source, endpoint)
            .then(function (data){
                test.equal(data.resolver, resolvers.URL);
                test.done();
            });
    },
    GitHubRepo: function (test) {
        var source = "https://github.com/tcorral/Design-Patterns-in-Javascript.git";
        var decEndpoint = {
            "test/generated/repos/tcorral/ddpp" : source
        };
        mystiquex.getResolver(source, decEndpoint)
            .then(function (data){
                test.equal(data.resolver, resolvers.GITHUB);
                test.done();
            });
    },
    UrlZipRepo: function (test){
        var source = "https://github.com/tcorral/Design-Patterns-in-Javascript/archive/master.zip";
        var decEndpoint = {
            "test/generated/repos/tcorral/ddpp" : source
        };
        mystiquex.getResolver(source, decEndpoint)
            .then(function (data){
                test.equal(data.resolver, resolvers.URL);
                test.done();
            });
    }
};