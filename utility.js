
const config = require("./config.js").load();
var randtoken = require('rand-token');
const csv = require('csv-parser');
const es = require('event-stream')
const fs = require('fs');
const uuid = require('uuid')
var moment = require('moment');
const nodemailer = require('nodemailer');
const couchdb = require('./couchdb.js');
const database = require('./database.js');
const fiscal_check = require('./fiscal_check.js')


var list_cities = new Array();
var list_countries = new Array();
var list_postalcodes = new Array();

module.exports = {
    import_Olo2OloDataXmlSystemMigrationModalities(filename) {
        if (filename) {
            //Olo2OloDataXmlSystemMigrationModalities
            fs.createReadStream(filename)
                .pipe(csv())
                .on('data', (row) => {
                    var mm = row;
                    database.entities.olo2olo.findOne({ where: { cow: mm.cow } }).then(function (olo) {
                        if (olo !== null) {
                            olo.objData = {
                                migrationModalities: [
                                    { description: "CallCenter", phone: mm.sys1Phone, authenticationPolicy: mm.sys1AuthPolicy, timePolicy: mm.sys1TimePolicy, modality: mm.sys1Modality },
                                    { description: "FaxMail", address: mm.sys2Address, authenticationPolicy: mm.sys2AuthPolicy, timePolicy: mm.sys2TimePolicy, modality: mm.sys2Modality },
                                    { description: "Web", phone: mm.sys3Url, authenticationPolicy: mm.sys3AuthPolicy, timePolicy: mm.sys3TimePolicy, modality: mm.sys3Modality }
                                ]
                            }
                            olo.save()
                                .catch((error) => {console.log("Error in olo update")})
                                .then((oloObject) => console.log("update olo object successfully "+oloObject.company));
                        }
                        else {
                            console.log('Olo company update general error: ' + olo.company);
                        }
                    });
                })
                .on('end', () => {
                    console.log('CSV file successfully processed.' + filename);
                });
        }
    },
    import_Olo2OloDataXmlSystem(filename) {
        //Olo2OloDataXmlSystemMigration
        if (filename) {
            fs.createReadStream(filename)
                .pipe(csv())
                .on('data', (row) => {
                    obj = row;
                    var olo = row;
                    database.entities.olo2olo.findOne({ where: { cow: olo.cow } }).then(function (item) {
                        if (item === null) {
                            database.entities.olo2olo.create(olo).then(function (objnew) {
                                if (objnew.id !== null) {
                                    console.log('Olo company insert successfully: ' + olo.company);
                                }
                                else {
                                    console.log('Olo company insert error: ' + olo.company);
                                }
                            });
                        }
                        else {
                            console.log('Olo company exists: ' + olo.company);
                        }
                    });
                })
                .on('end', () => {
                    console.log('CSV file successfully processed.' + filename);
                });
        }
    },
    import_CrmCom_Devices_Couchdb() {
        couchdb.getAllDevices(function (obj) {

            var device = {};
            device.uid = obj._id;
            device.description = obj.denominazione_dispositivo;
            device.techasset = "WIFI"
            device.companyasset = "WIFINETCOM SRL"
            device.type = "ROUTER"
            device.vendor = obj.marca_modello;
            device.model = obj.marca_modello;
            device.mac = obj.mac;
            device.ipv4 = obj.ip_wan;
            device.ipv6 = ""
            device.state = obj.status;
            device.note = obj.note_dispositivo;
            device.objData = {
                bandwith: {
                    download_min: obj.download_min,
                    download_max: obj.download_max,
                    upload_min: obj.upload_min,
                    upload_max: obj.upload_max
                },
                wifi: {
                    ssid: obj.wifi_ssid,
                    password: obj.wifi_password,
                    security_type: obj.wifi_crypt_type
                },
                firmware_version: obj.firmware
            };

            database.entities.customer.findOne({ where: { uid: obj.id_cliente } }).then(function (customer_search) {
                if (customer_search !== null) {
                    database.entities.contract.findOne({ where: { uid: obj.id_contratto } }).then(function (contract_search) {
                        if (contract_search !== null) {
                            database.entities.device.findOne({ where: { mac: obj.mac } }).then(function (devices_search) {
                                if (devices_search === null) {
                                    database.entities.device.create(device).then(function (device_new) {
                                        device_new.setCustomer(customer_search);
                                        device_new.setContract(contract_search);
                                        device_new.save();
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    console.log('Error inserting devices: ' + obj.mac);
                }
            });
        });
    },
    import_CrmCom_Contracts_Couchdb() {
        var makePassword = this.makePassword;
        couchdb.getAllContracts(function (obj) {
            var contract = {};
            var contract_service = {};
            contract.uid = obj._id;
            contract.description = obj.codice_contratto;
            contract.address = obj.indirizzo_esecuzione_contratto;
            contract.startdate = moment(obj.data_sottoscrizione, "DD-MM-YYYY").toDate();
            contract.enddate = moment(obj.data_scadenza, "DD-MM-YYYY").toDate();
            contract.duration = 365;
            contract.state = obj.status;
            contract.billingperiod = 60;
            contract.automaticrenew = 1;
            contract.businessflag = true;
            contract.objdata = { contact: obj.persona_riferimento_contratto, note: obj.note_contratto };

            contract_service.service_description = obj.denominazione_contratto;
            contract_service.price = parseFloat(obj.importo_mensile);
            contract_service.vat = 22;
            contract_service.billingPeriod = 60;
            contract_service.state = obj.status;
            contract_service.dayinvoicereminder = 10;
            contract_service.nopaydaysbeforedeactivation = 15;
            contract_service.dayforexpirationwarning = 15;

            database.entities.customer.findOne({ where: { uid: obj.id_cliente } }).then(function (cust) {
                if (cust !== null) {
                    database.entities.contract.findOne({ where: { description: obj.codice_contratto } }).then(function (contracts_search) {
                        if (contracts_search === null) {
                            database.entities.contract.create(contract).then(function (contract_new) {
                                contract_new.setCustomer(cust);
                                contract_new.save();
                                database.entities.contractService.create(contract_service).then(function (contract_service_new) {
                                    if (contract_service_new !== null) {
                                        contract_service_new.setContract(contract_new);
                                        contract_service_new.save();
                                    }
                                    else {
                                        console.log('Error inserting contract service: ' + contract_service_new.service_description);
                                    }
                                });
                            });
                        }
                    });
                }
                else {
                    console.log('Error inserting customer: ' + item.vatcode);
                }
            });
        });
    },
    import_CrmCom_Customers_Couchdb() {
        var makePassword = this.makePassword;
        couchdb.getAllCustomers(function (obj) {
            if (obj.codice_fiscale[0] >= '0' && obj.codice_fiscale[0] <= '9' && obj.isAzienda === "yes") { //import company
                var cust = {};
                cust.uid = obj._id;
                cust.company = obj.nome_cliente;
                cust.address = obj.indirizzo_cliente;
                cust.companyaddress = obj.indirizzo_cliente;
                cust.companypec = obj.email;
                cust.vatcode = obj.codice_fiscale;
                if (obj.telefono_fisso)
                    cust.phone = obj.telefono_fisso.replace("/", "");
                if (obj.telefono_mobile)
                    cust.mobilephone = obj.telefono_mobile.replace("/", "");

                if (!cust.phone && cust.mobilephone) cust.phone = cust.mobilephone;
                if (!cust.phone) cust.phone = "empty";

                cust.email = obj.email;
                cust.username = cust.email;
                cust.password = makePassword(8);
                cust.postalcode = "empty";
                cust.firstname = "empty";
                cust.lastname = "empty";
                cust.address = "empty";

                database.entities.customer.findOne({ where: { vatcode: cust.vatcode, uid: cust.uid } }).then(function (item) {
                    if (item === null) {
                        database.entities.customer.create(cust).then(function (objnew) {
                            if (objnew !== null) {
                                console.log('Customer insert successfully: ' + objnew.vatcode);
                            }
                        });
                    }
                    else {
                        console.log('Error inserting customer: ' + item.vatcode);
                    }
                });

            } else {  //import private customer
                var cust = {};
                cust.uid = obj._id;
                cust.firstname = obj.nome_cliente;
                cust.lastname = obj.cognome_cliente;
                cust.address = obj.indirizzo_cliente;
                cust.codfis = obj.codice_fiscale;
                if (obj.telefono_fisso)
                    cust.phone = obj.telefono_fisso.replace("/", "");
                if (obj.telefono_mobile)
                    cust.mobilephone = obj.telefono_mobile.replace("/", "");

                if (!cust.phone && cust.mobilephone) cust.phone = cust.mobilephone;
                if (!cust.phone) cust.phone = "empty";

                cust.email = obj.email;
                cust.username = cust.email;
                cust.password = makePassword(8);
                cust.postalcode = "empty";
                database.entities.customer.findOne({ where: { codfis: cust.codfis, uid: cust.uid } }).then(function (item) {
                    if (item === null) {
                        database.entities.customer.create(cust).then(function (objnew) {
                            if (objnew !== null) {
                                console.log('Customer insert successfully: ' + objnew.codfis);
                            }
                        });
                    }
                    else {
                        console.log('Error inserting customer: ' + item.codfis);
                    }
                });
            }

        });
    },
    import_CrmCom_Clienti_Csv(filename) {
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (row) => {
                console.log(row);
                obj = row;
                var cust = {};
                if (obj.codfis[0] >= '0' && obj.codfis[0] <= '9' && obj.azienda === "yes") {
                    cust.firstname = "empty";
                    cust.lastname = "empty";
                    cust.company = obj.nome;
                    cust.address = obj.indirizzo;
                    cust.companyaddress = obj.indirizzo;
                    cust.companypec = obj.email;
                    cust.vatcode = obj.codfis;
                    cust.phone = obj.tel.replace("/", "");
                    cust.mobilephone = obj.mob.replace("/", "");;
                    cust.email = obj.email;
                    cust.username = cust.email;
                    cust.password = this.makePassword(8);
                    cust.postalcode = "empty";
                    cust.firstname = "empty";
                    cust.lastname = "empty";
                    cust.address = "empty";

                    database.entities.customer.findOne({ where: { vatcode: cust.vatcode } }).then(function (item) {
                        if (item === null) {
                            database.entities.customer.create(cust).then(function (objnew) {
                                if (objnew !== null) {
                                    console.log('Customer insert successfully: ' + objnew.vatcode);
                                }
                            });
                        }
                        else {
                            console.log('Error inserting customer: ' + item.vatcode);
                        }
                    });

                } else {
                    cust.firstname = obj.nome;
                    cust.lastname = obj.cognome;
                    cust.address = obj.indirizzo;
                    cust.codfis = obj.codfis;
                    cust.phone = obj.tel.replace("/", "");
                    cust.mobilephone = obj.mob.replace("/", "");;
                    cust.email = obj.email;
                    cust.username = cust.email;
                    cust.password = this.makePassword(8);
                    cust.postalcode = "empty";
                    database.entities.customer.findOne({ where: { codfis: cust.codfis } }).then(function (item) {
                        if (item === null) {
                            database.entities.customer.create(cust).then(function (objnew) {
                                if (objnew !== null) {
                                    console.log('Customer insert successfully: ' + objnew.codfis);
                                }
                            });
                        }
                        else {
                            console.log('Error inserting customer: ' + item.codfis);
                        }
                    });
                }

            })
            .on('end', () => {
                console.log('CSV file successfully processed.' + filename);
            });
    },
    import_DeviceBackbone_Wifinetcom_Csv(filename) {
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (row) => {
                if (row.descrizione !== "" && row.ip !== "") {
                    var device_backbone = {};
                    device_backbone.description = row.descrizione;
                    device_backbone.type = "backbone device"
                    device_backbone.vendor = "Mikrotik/Ubiquity"
                    device_backbone.model = row.modello;
                    device_backbone.mac = "";
                    device_backbone.ipv4 = row.ip;
                    device_backbone.ipv6 = "";
                    device_backbone.status = "";
                    device_backbone.note = "";
                    device_backbone.objData = {
                        security_profile_80211: {
                            security_type: row.security_type,
                            security_password: row.security_password,
                            ssid: row.ssid
                        }
                    }
                    database.entities.deviceBackbone.create(device_backbone).then(function (objnew) {
                        if (objnew !== null) {
                            console.log("Device backbone import successfully");
                        }
                    });
                }

            })
            .on('end', () => {
                console.log('CSV file successfully processed.' + filename);
            });
    },
    import_SiteBackbone_Wifinetcom_Csv(filename) {
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (row) => {
                if (row.descrizione !== "" && row.latitude !== "" && row.longitude !== "") {
                    var site = {};
                    site.description = row.description;
                    site.longitude = row.longitude;
                    site.latitude = row.latitude;
                    var words = row.description.split(" ");
                    site.address = words[0];
                }
                database.entities.siteBackbone.create(site).then(function (objnew) {
                    if (objnew !== null) {
                        console.log("Site backbone import successfully");
                    }
                });
            })
            .on('end', () => {
                console.log('CSV file successfully processed.' + filename);
            });
    },
    makeAuthenticationCode() {
        var rnd = randtoken.generate(5, "0123456789");
        var d = new Date(); //now date
        var ticks = d.getTime();
        return ticks.toString() + rnd.toString();
    },
    makePinCode() {
        return randtoken.generate(5, "0123456789");
    },
    makePassword(lenght) {
        return randtoken.generate(lenght);
    },
    makeUuid() {
        var code = uuid.v1();
        return code;
    },
    import_localities(filename) {
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (row) => {
                database.entities.locality.create(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed.' + filename);
            });
    },
    load_cities(filename) {
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (row) => {
                list_cities.push(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed.' + filename);
            });
    },
    load_countries(filename) {
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (row) => {
                list_countries.push(row.Country);
            })
            .on('end', () => {
                console.log('CSV file successfully processed.' + filename);
            });
    },
    load_postalcodes(filename) {
        database.entities.locality.findAll().then(result => {
            result.forEach(function (item) {
                var str_item = item.postalcode + " (" + item.city + ")";
                list_postalcodes.push(str_item);
            });
        });
    },
    get_cities_by_postalcode(pc, callback) {
        database.entities.locality.findAll({
            where: { 'postalcode': pc },
            attributes: ['city']
        }).then(res => {
            res.forEach(function (item, index) {
                list_cities.push(item.city);
                if (index == res.length - 1) {
                    callback(list_cities);
                }
            });
        })
    },
    get_cities() {
        var names = new Array();
        list_cities.forEach(function (item) {
            var name = item['Denominazione in italiano'];
            names.push(name);
        });
        return names;
    },
    get_countries() {
        return list_countries;
    },
    get_postalcodes() {
        return list_postalcodes;
    },
    async notify_registration_by_email(data, subhject, msg) {
        var cust = data.customer;
        var cont = data.contract;
        if (!cust) return;
        if (!cont) return;
        if (!subject) return;
        if (!msg) return;

        var msg = "<p><strong>Registrazione avvenuta con successo<strong><br>";
        msg += "<p>Username: <b>" + cust.username + "</b><p>";
        msg += "<p>Password: <b>" + cust.pssword + "</b><p>";
        msg += "Area clienti: " + config.links.customerarea;
        msg += "<p><b>Si prega di stampare e conservare queste credenziali di acceso</b></p>";
        msg += "<br><br><br>";
        msg += "<p>clicca sul seguente link per accedere alla configurazione dei tuoi servizi</p>";
        msg += "link secret service configuration";
        //Load config mail server from databse
        var mailserver_config = await this.loadConfig("mailserver");
        var mailserver = JSON.parse(mailserver_config.value);

        var transporter = nodemailer.createTransport({
            host: mailserver.host,
            port: mailserver.port,
            auth: mailserver.auth,
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            }
        });

        var mailOptions = {
            from: 'no-reply@wifinetcom.net',
            to: cust.email,
            subject: 'registrazione area utenti Wifinetcom SRL',
            text: 'Registrazione avvenuta con successo'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    },
    async storeConfig(keySection, configJSON) {
        obj = { key: keyStection, value: configJSON };
        database.entities.config.findOne({ where: { key: obj.key } }).then(function (item) {
            if (item === null) {
                database.entities.config.create(obj).then(function (objnew) {
                    if (objnew !== null) {
                        console.log("Configuration saved: " + objnew.key);
                    }
                });
            }
            else {
                console.log("Configuration saving error");
            }
        });
    },
    async loadConfig(keySection) {
        return await database.entities.config.findOne({ where: { key: keySection } });
    }
}
