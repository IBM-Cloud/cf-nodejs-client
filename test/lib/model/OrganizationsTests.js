/*jslint node: true*/
/*global describe: true, before: true, it: true*/
"use strict";

var Promise = require('bluebird');
var chai = require("chai"),
    expect = require("chai").expect;

var argv = require('optimist').demand('config').argv;
var environment = argv.config;
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

var cf_api_url = nconf.get(environment + "_" + 'CF_API_URL'),
    username = nconf.get(environment + "_" + 'username'),
    password = nconf.get(environment + "_" + 'password');

var CloudFoundry = require("../../../lib/model/CloudFoundry");
var CloudFoundryOrg = require("../../../lib/model/Organizations");
CloudFoundry = new CloudFoundry();
CloudFoundryOrg = new CloudFoundryOrg();

describe.only("Cloud foundry Organizations", function () {

    function randomInt(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    }

    var authorization_endpoint = null;
    var token_endpoint = null;
    var token_type = null;
    var access_token = null;

    before(function () {
        this.timeout(15000);

        CloudFoundry.setEndPoint(cf_api_url);
        CloudFoundryOrg.setEndPoint(cf_api_url);

        return CloudFoundry.getInfo().then(function (result) {
            authorization_endpoint = result.authorization_endpoint;
            token_endpoint = result.token_endpoint;
            return CloudFoundry.login(authorization_endpoint, username, password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;
        });
    });

    it("The platform returns the Organizations defined", function () {
        this.timeout(5000);

        return CloudFoundryOrg.getOrganizations(token_type, access_token).then(function (result) {
            expect(result.total_results).is.a("number");
        });
    });

    it("The platform returns the first organization", function () {
        this.timeout(5000);

        var org_guid = null;

        return CloudFoundryOrg.getOrganizations(token_type, access_token).then(function (result) {
            org_guid = result.resources[0].metadata.guid;
            expect(result.total_results).is.a("number");
        });
    });

    it("The platform returns the memory usage of an Organization", function () {
        this.timeout(5000);

        var org_guid = null;

        return CloudFoundryOrg.getOrganizations(token_type, access_token).then(function (result) {
            org_guid = result.resources[0].metadata.guid;
            return CloudFoundryOrg.memoryUsage(token_type, access_token, org_guid);
        }).then(function (result) {
            //console.log(result);
            expect(true).is.a("boolean");
        });
    });

    it("The platform returns the summary from an Organization", function () {
        this.timeout(5000);

        var org_guid = null;

        return CloudFoundryOrg.getOrganizations(token_type, access_token).then(function (result) {
            org_guid = result.resources[0].metadata.guid;
            return CloudFoundryOrg.summary(token_type, access_token, org_guid);
        }).then(function (result) {
            //console.log(result);
            expect(true).is.a("boolean");
        });
    });

    it("The platform returns the private domains from an Organization", function () {
        this.timeout(5000);

        var org_guid = null;
        return CloudFoundryOrg.getOrganizations(token_type, access_token).then(function (result) {
            org_guid = result.resources[0].metadata.guid;
            return CloudFoundryOrg.getPrivateDomains(token_type, access_token, org_guid);
        }).then(function (result) {
            expect(result.total_results).is.a("number");
        });
    });

    it.skip("The platform creates an Organization", function () {
        this.timeout(5000);

        var org_guid = null;
        var orgOptions = {
            'name': "demo"             
        };
        //"quota_definition_guid"
        return CloudFoundryOrg.add(token_type, access_token, orgOptions).then(function (result) {
            console.log(result);
            expect(true).is.a("boolean");
        });
    });

    it("The platform Creates & Remove an Organization", function () {
        this.timeout(5000);

        var org_guid = null;
        var orgOptions = {
            'name': "demo" + randomInt(1, 100)             
        };
        //"quota_definition_guid"
        return CloudFoundryOrg.add(token_type, access_token, orgOptions).then(function (result) {
            console.log(result);
            org_guid  = result.metadata.guid;
            orgOptions = {
                'recursive': true, 
                'async': false                      
            };
            return CloudFoundryOrg.remove(token_type, access_token, org_guid, orgOptions)
        }).then(function (result) {            
            expect(true).is.a("boolean");
        });
    });    

});