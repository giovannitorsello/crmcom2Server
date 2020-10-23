const config = require("./config.js");
var utility = require("./utility.js");
var mailer =require('./mailer.js');
var orm = require('orm');

module.exports={

setup(app) {

  //customer actions
  app.post('/customerLogin', function (req, res)      { customerLogin(req, res, Customer) });
  app.post('/customerLogout', function (req, res)     { customerLogout(req, res, Customer) });
  app.post('/customerStore', function (req, res)      { customerStore(req, res, Customer) });
  app.post('/customerDelete', function (req, res)     { customerDelete(req, res, Customer) });
  app.post('/customerFind', function (req, res)       { customerFind(req, res, Customer) });
  app.post('/sendCustomerCredential', function (req, res) { sendCustomerCredential(req, res, Customer) });

  console.log("Customer Rest Service initialized.");
},


customerLogin(req, res, Customer) {
  
},

customerLogout(req, res, Customer) {
  
},

customerStore(req, res, Customer) {
  console.log("Write customer data.");
  console.log(req.body);
  
},

customerDelete(req, res, Customer) {
  
},

customerFind(req, res, Customer) {
  
},

sendCustomerCredential(req, res, Customer) {
  
}

}