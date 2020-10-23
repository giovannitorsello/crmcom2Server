var config = require("../config.js");
var utility = require("../utility.js");
var dataStructureMigration = require('./dataStructuresMigration.js');
var validator = require('xsd-schema-validator');
var xmlConverter = require('xml-js');

const fs = require('fs');
var FormData = require('form-data');

const { Sequelize, Model, DataTypes } = require('sequelize');
var path = require('path');

const operators=[
    {id: 1, op: 'TIM', des: 'Sub Loop ULL', cos: '009'},
    {id: 2, op: 'TIM', des: 'VULA FTTCab Condiviso', cos: '010'},
    {id: 3, op: 'TIM', des: 'VULA FTTCab Naked', cos: '011'},
    {id: 4, op: 'TIM', des: 'VULA FTTH', cos: '012'},
    {id: 5, op: 'TIM', des: 'BTS FTTCab Condiviso', cos: '013'},
    {id: 6, op: 'TIM', des: 'BTS FTTCab Naked', cos: '014'},
    {id: 7, op: 'TIM', des: 'BTS FTTH', cos: '015'},
    {id: 8, op: 'TIM', des: 'Fibra E2E da MKT 4', cos: '016'},
    {id: 9, op: 'TIM', des: 'Segmento verticale in fibra da MKT 4', cos: '017'},
    {id: 10, op: 'OpenFiber', des: 'GPON Attivo', cos: 'OFA'},
    {id: 11, op: 'OpenFiber', des: 'GPON Passivo', cos: 'OFB'},
    {id: 12, op: 'Fastweb',   des: 'GPON Attivo', cos: 'FWA'},
    {id: 13, op: 'Fastweb',   des: 'GPON Passivo', cos: 'FWB'},
    {id: 14, op: 'Unidata',   des: 'GPON Attivo', cos: 'NIC'},
    {id: 15, op: 'Unidata',   des: 'GPON Passivo', cos: 'NID'},
    {id: 16, op: 'Len Fiber', des: 'GPON Attivo', cos: 'LFE'},
    {id: 17, op: 'Len Fiber', des: 'GPON Passivo', cos: 'LFF'}
]

const trasmission_errors= [
    {id: '1', code: '01', text: 'Nome file non valido'},
    {id: '2', code: '02', text: 'Nome OPERATORE mittente non valido'},
    {id: '3', code: '03', text: 'Tipo file non valido'},
    {id: '4', code: '04', text: 'File non presente'},
    {id: '5', code: '05', text: ' File non valido'},
    {id: '6', code: '06', text: 'Generico (ad es. errore sistema)'}
]

/*
    DNS DNS del server operatore che espone il servizio di upload.
    Porta Porta su cui risponde il server dell’operatore.
    Context Context Root dell’applicazione dell’operatore preposta a ricevere i file.
    NomeComponente Nome della servlet preposta all’acquisizione del file – ad esempio upload
    Operatore Codice identificativo dell’operatore che invia il file 
    TipoFile
    Tipologia del file da inviare. I possibili valori sono:
        • ‘N’ per i file contenenti le richieste di Migrazione destinate all’operatore verso cui si sta effettuando  l’upload
        • ‘R’ per i file contenenti le risposte alle richieste di Migrazione precedentemente inviate verso un operatore.
    FileName
    Nome del file da inviare all’operatore. 
*/
var numberProgressiveXml=0;

var sandBoxTIM = {
    server: 'dbcfxcol.tim.it',
    ip: '194.243.145.9',
    port: '7502',
    context: 'ROOT',
    component: 'upload',
    url: 'https://dbcfx.tim.it:7502/upload',
    filename: ''
}

function validateXMLFile(fileXML, fileXSD, callback) {
    var xmlStream = fs.createReadStream(fileXML);

    validator.validateXML(xmlStream, fileXSD, function (err, result) {
        if (err) {
            callback({ status: 'error', error: err });
        }
        else{
            sendFileXml(sandBoxTIM, xmlFile,callback);                
        }
    });
}

function sendFileXml(serverOlo, xmlFile, callback) {
    var form = new FormData();
    form.append('server', '5.83.124.80');
    form.append('ip', '5.83.124.80');
    form.append('port', '7502');
    form.append('context', '/');
    form.append('component', 'olo2olo');
    form.append('url', 'https://5.83.124.80:7502/olo2olo');

    OpDonating="";
    OpRecipient="";
    DateAAAAMMGG="";
    numberProgressiveXml++;
    //var filename="N_"+OpDonating+"_"+OpRecipient+"_"+DateAAAAMMGG+"_"+numberProgressiveXml+".xml";
    var filename=xmlFile;
    form.append(filename, fs.createReadStream(xmlFile));

    form.submit(serverOlo.url, function (err, res) {
        callback({status: "OK", msg: "Xml file sent successfully", result: res});
        //res.resume();
    });
}

module.exports = {
    testN1() {
        xmlFile = __dirname + "/testXML/n1.xml";
        validateXMLFile(xmlFile, __dirname + "/xsd/xml1.xsd", res => {
            if (res.status === "OK") {
                sendFileXml(sandBoxTIM, xmlFile, ans => {
                    console.log(ans);
                });
            }
        })
    },
    load_routes(olo2oloApp, database) {
        //this.testN1();
        olo2oloApp.get("/olo2olo/connection_verify", function (req, res) {
            res.send({status: "OK", msg: "Olo2Olo connection is working on https"});
        });        
        olo2oloApp.post("/olo2olo/connection_verify", function (req, res) {
            res.send({status: "OK", msg: "Olo2Olo connection is working on https"});
        });
        olo2oloApp.post("/olo2olo/get_all_olo", function (req, res) {
            database.entities.olo2Olo.findAll().then(function (results) {
                if (results !== null)
                    res.send({ status: "OK", msg: "OLO operators found", results: results });
                else
                    res.send({ status: "error", msg: "Search failed", results: {} });
            });
            res.send({status: "OK", msg: "Operatord found", result: operators});
        });
        olo2oloApp.post("/olo2olo/get_trasmission_errors", function (req, res) {
            res.send({status: "OK", msg: "Operatord found", result: trasmission_errors});
        });
        olo2oloApp.post("/olo2olo/N1RecToWhslMigrationRequest", function (req, res) {
            //Call xmlConverter.
            xmlFile = "prova.xml";
            validateXMLFile(xmlFile, __dirname + "./wsld/RecipientMigrationService_rev1.xsd", res => {
                if (res.status === "OK") {
                    sendFile(sandBoxTIM, xmlFile, ans => {
                        console.log(ans);
                    });
                }
            })
        });
    }
}

