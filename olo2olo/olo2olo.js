const config = require("../config.js").load();
var utility = require("../utility.js");
var routes_olo_area=require('./route_olo_area.js')

const fs= require('fs');
const https = require('https');
var express = require('express');

const xmlDonatingMigrationNotify  = require('fs').readFileSync(process.cwd()+'/data/wsdl/DonatingMigrationNotify_rev1.wsdl', 'utf8');
const xmlDonatingMigrationService = require('fs').readFileSync(process.cwd()+'/data/wsdl/DonatingMigrationService_rev1.wsdl', 'utf8');
const xmlRecipientMigrationNotify  = require('fs').readFileSync(process.cwd()+'/data/wsdl/RecipientMigrationNotify_rev1.wsdl', 'utf8');
const xmlRecipientMigrationService = require('fs').readFileSync(process.cwd()+'/data/wsdl/RecipientMigrationService_rev1.wsdl', 'utf8');

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/olo2olo.wifinetcom.net/privkey.pem','utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/olo2olo.wifinetcom.net/cert.pem','utf8'),
    ca:  fs.readFileSync('/etc/letsencrypt/live/olo2olo.wifinetcom.net/chain.pem','utf8')
};

const olo2oloApp=express();

module.exports = {
    mainApp: {},
    database: {},
    olo2oloServer: {},
    setup(app, database) {
        this.mainApp=app;
        this.database=database;
        https.createServer(options, olo2oloApp).listen(config.olo2oloServer.https_port);
        
        routes_olo_area.load_routes(olo2oloApp, database);        
    },
    
}






        //soap.listen(app, '/donatingMigrationService', this.donatingService, xmlDonatinMigrationService);
        //soap.listen(app, '/recipientMigrationService', this.recipientService, xmlDonatinMigrationService);

    /*donatingService: {
        MyService: {
            MyPort: {
                MyFunction: function (args) {
                    return {
                        name: args.name
                    };
                },
    
                // This is how to define an asynchronous function.
                MyAsyncFunction: function (args, callback) {
                    // do some work
                    callback({
                        name: args.name
                    });
                },
    
                // This is how to receive incoming headers
                HeadersAwareFunction: function (args, cb, headers) {
                    return {
                        name: headers.Token
                    };
                },
    
                // You can also inspect the original `req`
                reallyDetailedFunction: function (args, cb, headers, req) {
                    console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
                    return {
                        name: headers.Token
                    };
                }
            }
        }
    },
    recipientService: {
        MyService: {
            MyPort: {
                MyFunction: function (args) {
                    return {
                        name: args.name
                    };
                },
    
                // This is how to define an asynchronous function.
                MyAsyncFunction: function (args, callback) {
                    // do some work
                    callback({
                        name: args.name
                    });
                },
    
                // This is how to receive incoming headers
                HeadersAwareFunction: function (args, cb, headers) {
                    return {
                        name: headers.Token
                    };
                },
    
                // You can also inspect the original `req`
                reallyDetailedFunction: function (args, cb, headers, req) {
                    console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
                    return {
                        name: headers.Token
                    };
                }
            }
        }
    },*/
