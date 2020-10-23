const config = require("./config.js");
var utility = require("./utility.js");
var mailer =require('./mailer.js');
var orm = require('orm');

module.exports={

module_setup(app) {

  //User actions
  app.post('/userLogin', function (req, res)      { userLogin(req, res, Customer) });
  app.post('/userLogout', function (req, res)     { userLogout(req, res, Customer) });
  app.post('/userStore', function (req, res)      { userStore(req, res, Customer) });
  app.post('/userDelete', function (req, res)     { userDelete(req, res, Customer) });
  app.post('/userFind', function (req, res)       { userFind(req, res, Customer) });
  app.post('/userSendCredential', function (req, res) { userSendCredential(req, res, Customer) });

},


userLogin(req, res, Customer) {
  
},

userLogout(req, res, Customer) {
  
},

userStore(req, res, Customer) {
  
},

userDelete(req, res, Customer) {
  
},

userFind(req, res, Customer) {
  
},

userSendCredential(req, res, Customer) {
  
}


}