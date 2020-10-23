const config = require("./config.js").load();
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

    }
}