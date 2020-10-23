var config = require("./config.js");
var utility = require("./utility.js");


const fs = require('fs');
const https = require('https');
const http = require('https');
const { Sequelize, Model, DataTypes } = require('sequelize');
var path = require('path');

//Geo library
var proj4 = require('proj4');


module.exports = {
    load_routes(app, database) {
        /////////////////  ROUTE FOR CUSTOMER AREA /////////////////////
        app.post("/customerarea/get_customer_services", function (req, res) {
            var id_contr = req.body.contractId;
            database.entities.contract.findOne({ where: { id: id_contr } }).then(function (contract) {
                if (contract !== null) {
                    req.body.contract = contract;
                    database.entities.contractService.findAll({ where: { contractId: contract.id } }).then(function (results) {
                        res.send(results);
                    });
                }
            });
        });

        app.post("/customerarea/get_customer_contracts", function (req, res) {
            var customer = req.session.customer;
            database.entities.contract.findAll({ where: { customerId: customer.id } }).then(function (results) {
                if (results !== null && results[0] !== null) {
                    req.body.contracts = results[0];
                }
                res.send(results);
            });
        });

        app.get("/", function (req, res) {
            var customer_session = req.session.customer;
            if (customer_session) {
                file_html = path.join(__dirname, "/websrc/html/customerarea/main.html");
                res.sendFile(file_html);
            }
            else {
                file_html = path.join(__dirname, "/websrc/html/customerarea/login.html");
                res.sendFile(file_html);
            }
        });

        app.get("/customerarea/registration", function (req, res) {
            file_html = path.join(__dirname, "/websrc/html/customerarea/wizard_discovery_services.html");
            res.sendFile(file_html);
        });

        app.get("/customerarea/login", function (req, res) {
            file_html = path.join(__dirname, "/websrc/html/customerarea/login.html");
            res.sendFile(file_html);
        });

        app.get("/customerarea/main", function (req, res) {
            var customer_session = req.session.customer;
            if (customer_session) {
                file_html = path.join(__dirname, "/websrc/html/customerarea/main.html");
                res.sendFile(file_html);
            }
            else {
                file_html = path.join(__dirname, "/websrc/html/customerarea/login.html");
                res.sendFile(file_html);
            }
        });

        app.post("/customerarea/login", function (req, res) {
            var user = req.body.username;
            var pass = req.body.password;
            database.entities.customer.findOne({ where: { username: user, password: pass } }).then(function (item) {
                if (item == null) {
                    res.send({ status: "error", msg: "Login error", redirect: config.links.customerarea });
                }
                else {
                    //Login accepted
                    req.session.customer = item;
                    res.send({ status: "OK", msg: "Login accepted.", redirect: '/customerarea/main' });                    
                }
            });
        });

        app.post("/customerarea/logout", function (req, res) {
            req.session.destroy(function (err) {
                if (err) { console.log(err); }
                else { res.redirect('/customerarea/login'); }
            });
        });

        app.get("/customerarea/logout", function (req, res) {
            req.session.destroy(function (err) {
                if (err) { console.log(err); }
                else { res.redirect('/customerarea/login'); }
            });
        });

        app.post("/customerarea/customer_registration", function (req, res) {
            console.log(req.body);
            customer = req.body;

            //Check email
            database.entities.customer.findOne({ where: { email: customer.email } }).then(function (item) {
                if (item != null) {
                    //resend email
                    utility.notify_registration_by_email({ 'customer': item, 'contract': null });
                    res.send({ "customer": item, status: "exist", msg: "Email customer exists.", redirect: config.links.customerarea });
                }
            });
            //check codfis
            database.entities.customer.findOne({ where: { codfis: customer.codfis } }).then(function (item) {
                if (item != null) {
                    //resend email
                    utility.notify_registration_by_email({ 'customer': item, 'contract': null });
                    res.send({ "customer": item, status: "exist", msg: "Email customer exists.", redirect: config.links.customerarea });
                }
            });
            //check vatcode
            database.entities.customer.findOne({ where: { vatcode: customer.vatcode } }).then(function (item) {
                if (item != null) {
                    //resend email
                    utility.notify_registration_by_email({ 'customer': item, 'contract': null });
                    res.send({ "customer": customer, status: "exist", msg: "Vatcode customer exists." });
                }
            });

            database.entities.customer.findOne({ where: { codfis: customer.codfis, email: customer.email } }).then(function (item) {
                if (item === null) {
                    customer.username = customer.email;
                    customer.password = "1234";
                    customer.phone = customer.mobilephone;
                    //Insert customer
                    database.entities.customer.create(customer).then(function (cust) {
                        //Configurazione contratto vuoto
                        var contract = {};
                        contract.customerId = cust.id;
                        contract.description = "Contratto generico";
                        contract.address = cust.address;
                        contract.state = 'in compilazione';
                        contract.startdate = new Date();
                        contract.enddate = new Date(new Date(contract.startdate.getFullYear(), contract.startdate.getMonth(), contract.startdate.getDay()));
                        contract.duration = 365;
                        contract.billingperiod = 30;
                        contract.businessflag = true;
                        contract.automaticrenew = 1;
                        database.entities.contract.create(contract).then(function (contr) {
                            //notify by email to custoemr and administration
                            utility.notify_registration_by_email({ 'customer': cust, 'contract': contr });
                            res.send({ "customer": customer, "contract": contract, status: "OK", msg: "Customer and contract successfully registered" });
                        });
                    });
                }
                else {
                    utility.notify_registration_by_email({ 'customer': cust, 'contract': null });
                    res.send({ "customer": customer, status: "exist", msg: "Customer exists." });
                }
            });

        });


    }
}