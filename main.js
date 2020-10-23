var config = require("./config.js").load();
var utility = require("./utility.js");

const fs = require('fs');
const https = require('https');
const http = require('https');

//Geo library
var proj4 = require('proj4');

const { Sequelize, Model, DataTypes } = require('sequelize');


var express = require('express');
var session = require('express-session');
var path = require('path');
var FileCleaner = require('cron-file-cleaner').FileCleaner;
var multer = require('multer');
var bodyParser = require('body-parser');
//var orm = require('orm');
var cors = require('cors');
var database = require('./database.js')
var devicesUtilities = require('./devicesUtilities.js')
var olo2olo= require('./olo2olo/olo2olo.js');


//file per route sezioni
var routes_admin_area = require("./route_admin_area.js");
var routes_cust_area = require("./route_customer_area.js");
var routes_utilities = require("./route_utilities.js");

var pingServerProcess=null;
var app = express();

//settin process to clean temporary folder as cache and uploads 
var fileWatcherUpload = new FileCleaner(__dirname + '/uploads/', 600000, '* */45 * * * *', { start: true });
var fileWatcherCache = new FileCleaner(__dirname + '/cache/', 600000, '* */45 * * * *', { start: true });

process.on('unhandledRejection', error => { console.log('Warning', error.message); });
process.chdir(__dirname);



//enable cross origin
app.use(cors());
//enable session
app.use(session({ secret: '##10293847##' }));
//covert body to JSON
app.use(bodyParser.json());
//parsing request object data during post
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies.
app.use(bodyParser.json({ limit: '2000kb' }));
//static websrc app
app.use('/websrc', express.static(__dirname + "/websrc"));
//upload folder
var upload = multer({ dest: './uploads/' })
//other static contents folders
app.use('/cache', express.static(__dirname + config.paths.cacheFolder));
app.use('/documents/xsd', express.static(__dirname + config.paths.documentsXsdFolder));


/* to enable https
const options = {
  key: fs.readFileSync(__dirname +'/certs/key.pem'),
  cert: fs.readFileSync(__dirname +'/certs/cert.pem')
};

//http.createServer(options, app).listen(config.server.http_port);
//https.createServer(options, app).listen(config.server.https_port);
*/


app.listen(config.server.http_port);

//Init componets and utilities.
database.setup(app, function () {
  //utility.load_postalcodes();
  //Loading route for customer area
  routes_admin_area.load_routes(app, database);
  routes_cust_area.load_routes(app, database);
  routes_utilities.load_routes(app, database);
  
  olo2olo.setup(app,database);
  

  //Discover passwords
  //devicesUtilities.dicoverCredentialsSSH(app, database);

  //Import data from old crmcom
  //utility.import_Olo2OloDataXmlSystemMigrationModalities(__dirname+'/../data_csv/Olo2OloDataXmlSystemMigrationModalities.csv');
  //utility.import_Olo2OloDataXmlSystem(__dirname+'/../data_csv/Olo2OloDataXmlSystem.csv');
  //utility.import_CrmCom_Clienti_Csv(__dirname+'/data_csv/cliente.csv');
  //utility.import_CrmCom_Customers_Couchdb();
  //utility.import_CrmCom_Contracts_Couchdb();
  //utility.import_CrmCom_Devices_Couchdb();
  //utility.import_DeviceBackbone_Wifinetcom_Csv("/home/torsello/Documenti/Attivita/WIFINETCOM_SRL/SviluppoSoftware/CrmCom2/CrmComServer/data_csv/DevicesBackbone.csv"");
  //utility.import_SiteBackbone_Wifinetcom_Csv("/home/torsello/Documenti/Attivita/WIFINETCOM_SRL/SviluppoSoftware/CrmCom2/data_csv/SitesBackboneWifinetcom.csv");
  //utility.notify_registration_by_email({});
});

