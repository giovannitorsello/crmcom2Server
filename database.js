const config = require("./config.js").load();
var path = require('path');

const { Sequelize, Model, DataTypes, QueryTypes } = require('sequelize');
const sequelize = new Sequelize(config.database);
sequelize.options.logging = true;


//const sequelize = new Sequelize('database', 'username', 'password', {host: config.database.host,dialect: config.database.type});
class User extends Model { };
class Customer extends Model { };
class ServiceTemplate extends Model { };
class Contract extends Model { };
class ContractService extends Model { };
class Invoice extends Model { };
class InvoiceEntry extends Model { };
class DeviceCustomer extends Model { };
class Locality extends Model { };
class InternetServiceLevel extends Model { };
class Config extends Model { };
class DeviceBackbone extends Model { };
class SiteBackbone extends Model { };
class Olo2Olo extends Model { };


module.exports = {

    seq: {},
    entities: {
        user: User,
        customer: Customer,
        serviceTemplate: ServiceTemplate,
        contract: Contract,
        contractService: ContractService,
        invoice: Invoice,
        invoiceEntry: InvoiceEntry,
        deviceCustomer: DeviceCustomer,
        deviceBackbone: DeviceBackbone,
        siteBackbone: SiteBackbone,
        olo2olo: Olo2Olo,
        locality: Locality,
        internetServiceLevel: InternetServiceLevel,
        config: Config,
    },
    setup(app, callback) {
        sequelize
            .authenticate()
            .then(() => {
                this.init_entities();
                console.log('Connection has been established successfully.');
                setTimeout(function () { console.log("Init database successfull"); callback(); }, 5000);                
                this.seq = sequelize;
                sequelize.options.logging = false;
            })
            .catch(err => {
                console.error('Unable to connect to the database:', err);
            });
    },
    init_entities() {
        User.init({
            username: { type: Sequelize.STRING, allowNull: false },
            password: { type: Sequelize.STRING, allowNull: false },
            role: { type: Sequelize.STRING, allowNull: false }, //admin, operator, ecc.
            state: { type: Sequelize.STRING, allowNull: false }, //active, suspended            
            email: { type: Sequelize.STRING, allowNull: false },
            codfis: { type: Sequelize.STRING, allowNull: true },
            address: { type: Sequelize.STRING, allowNull: true },
            mobilephone: { type: Sequelize.STRING, allowNull: true },
            firstname: { type: Sequelize.STRING, allowNull: false },
            lastname: { type: Sequelize.STRING, allowNull: false },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            objData: { type: Sequelize.JSON }
        }, {
            sequelize,
            modelName: 'user'
        });

        Customer.init({
            uid: { type: Sequelize.STRING, allowNull: false },
            firstname: { type: Sequelize.STRING, allowNull: false },
            lastname: { type: Sequelize.STRING, allowNull: false },
            email: { type: Sequelize.STRING, allowNull: false },
            pec: { type: Sequelize.STRING, allowNull: true },
            codfis: { type: Sequelize.STRING, allowNull: true },
            phone: { type: Sequelize.STRING, allowNull: false },
            mobilephone: { type: Sequelize.STRING, allowNull: false },
            address: { type: Sequelize.STRING, allowNull: false },
            postalcode: { type: Sequelize.STRING, allowNull: false },
            city: { type: Sequelize.STRING, allowNull: true },
            state: { type: Sequelize.STRING, allowNull: true },
            company: { type: Sequelize.STRING, allowNull: true },
            companyphone: { type: Sequelize.STRING, allowNull: true },
            companyaddress: { type: Sequelize.STRING, allowNull: true },
            companypec: { type: Sequelize.STRING, allowNull: true },
            vatcode: { type: Sequelize.STRING, allowNull: true },
            sdicode: { type: Sequelize.STRING, allowNull: true },
            username: { type: Sequelize.STRING, allowNull: false },
            password: { type: Sequelize.STRING, allowNull: false },
            onetimetemppassword: { type: Sequelize.STRING, allowNull: true },
            creationdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            businessflag: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
            objData: { type: Sequelize.JSON }
        }, {
            sequelize,
            modelName: 'customer'
        });

        ServiceTemplate.init({
            description: { type: Sequelize.STRING, allowNull: false },
            code: { type: Sequelize.STRING, allowNull: false },
            state: { type: Sequelize.STRING, allowNull: false }, //active, suspended
            unit: { type: Sequelize.STRING, allowNull: false },
            billingPeriod: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 60 },
            price: { type: Sequelize.FLOAT, allowNull: true },
            vat: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 22 },
            dayinvoicereminder: { type: Sequelize.INTEGER, allowNull: true },
            nopaydaysbeforedeactivation: { type: Sequelize.INTEGER, allowNull: true },
            dayforexpirationwarning: { type: Sequelize.INTEGER, allowNull: false },
            creationdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            objData: { type: Sequelize.JSON }

        }, {
            sequelize,
            modelName: 'serviceTemplate',
            tableName: 'servicesTemplate'
        });

        Contract.init({
            uid: { type: Sequelize.STRING, allowNull: false },
            description: { type: Sequelize.STRING, allowNull: false },
            address: { type: Sequelize.STRING, allowNull: false },
            startdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            enddate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            duration: { type: Sequelize.INTEGER, defaultValue: 365 },
            state: { type: Sequelize.STRING, defaultValue: 'in compilazione' }, //attivo, sospeso, annullato, scaduto
            billingperiod: { type: Sequelize.INTEGER, defaultValue: 60 },
            automaticrenew: { type: Sequelize.INTEGER, defaultValue: 1 },
            businessflag: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
            lastbillingdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            creationdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            objData: { type: Sequelize.JSON },
            objSign: { type: Sequelize.JSON }
        }, {
            sequelize,
            modelName: 'contract'
        });

        ContractService.init({
            service_description: { type: Sequelize.STRING, allowNull: false },
            price: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
            vat: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 22 },
            state: { type: Sequelize.STRING, allowNull: false }, //active, suspended  
            billingPeriod: { type: Sequelize.INTEGER, defaultValue: 60 },
            dayinvoicereminder: { type: Sequelize.INTEGER, allowNull: true },
            nopaydaysbeforedeactivation: { type: Sequelize.INTEGER, allowNull: true },
            lastbillingdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            dayforexpirationwarning: { type: Sequelize.INTEGER, allowNull: true },
            creationdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            objData: { type: Sequelize.JSON },
        }, {
            sequelize,
            modelName: 'contractService'
        });

        Invoice.init({
            number: { type: Sequelize.STRING, allowNull: false },
            invoicestate: { type: Sequelize.STRING, allowNull: true }, //prepared, sent, deleted
            businnesstate: { type: Sequelize.STRING, allowNull: true }, //payed, unpayed
            totalentries: { type: Sequelize.FLOAT, defaultValue: 0 },
            totalvat: { type: Sequelize.FLOAT, defaultValue: 0 },
            totalinvoice: { type: Sequelize.FLOAT, defaultValue: 0 },
            invoicedate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            creationdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            objdata: { type: Sequelize.JSON, defaultValue: "" },
            objsign: { type: Sequelize.JSON, defaultValue: "" }
        }, {
            sequelize,
            modelName: 'invoice'
        });

        InvoiceEntry.init({
            description: { type: Sequelize.STRING, allowNull: false },
            unit: { type: Sequelize.STRING, allowNull: false },
            number: { type: Sequelize.INTEGER, allowNull: false },
            price: { type: Sequelize.FLOAT, allowNull: false },
            vat: { type: Sequelize.FLOAT, allowNull: false },
            creationdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        }, {
            sequelize,
            modelName: 'invoiceEntry'
        });

        DeviceCustomer.init({
            uid: { type: Sequelize.STRING, allowNull: false },
            description: { type: Sequelize.STRING, allowNull: false },
            techasset: { type: Sequelize.STRING, allowNull: false }, //ADSL, FTTC, FTTH, WIFI
            companyasset: { type: Sequelize.STRING, allowNull: false }, //Telecom, Fastweb, Wifinetcom
            type: { type: Sequelize.STRING, allowNull: false }, //router, PC, DVR ecc.
            vendor: { type: Sequelize.STRING, allowNull: false }, //TPLINK, Microtik, ecc
            model: { type: Sequelize.STRING, allowNull: false },
            mac: { type: Sequelize.STRING, allowNull: false },
            ipv4: { type: Sequelize.STRING, allowNull: false },
            ipv6: { type: Sequelize.STRING, allowNull: true },
            state: { type: Sequelize.STRING, allowNull: false }, //active, suspended, 
            monitored: {type: Sequelize.STRING, allowNull: true}, //empty, monitored
            note: { type: Sequelize.STRING, allowNull: true },
            creationdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            objData: { type: Sequelize.JSON, allowNull: true },
        }, {
            sequelize,
            modelName: 'devicesCustomer',
            tableName: 'devicesCustomer'
        });

        DeviceBackbone.init({
            description: { type: Sequelize.STRING, allowNull: false },
            type: { type: Sequelize.STRING, allowNull: false },
            vendor: { type: Sequelize.STRING, allowNull: false },
            model: { type: Sequelize.STRING, allowNull: false },
            mac: { type: Sequelize.STRING, allowNull: false },
            ipv4: { type: Sequelize.STRING, allowNull: false },
            ipv6: { type: Sequelize.STRING, allowNull: true },
            state: { type: Sequelize.STRING, allowNull: false },
            note: { type: Sequelize.STRING, allowNull: true },
            creationdate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            objData: { type: Sequelize.JSON, allowNull: true }, //position, link with other devices
        }, {
            sequelize,
            modelName: 'deviceBackbone',
            tableName: 'devicesBackbone'
        });

        SiteBackbone.init({
            description: { type: Sequelize.STRING, allowNull: false },
            address: { type: Sequelize.STRING, allowNull: false },            
            latitude: { type: Sequelize.FLOAT, defaultValue: 0 },
            longitude: { type: Sequelize.FLOAT, defaultValue: 0 },            
            note: { type: Sequelize.STRING, allowNull: true },            
            objData: { type: Sequelize.JSON, allowNull: true },
        }, {
            sequelize,
            modelName: 'siteBackbone',
            tableName: 'sitesBackbone'
        });

        Olo2Olo.init({
            company: { type: Sequelize.STRING, allowNull: false },
            cow: { type: Sequelize.STRING, allowNull: false },            
            mailConsumer: { type: Sequelize.STRING(1000), allowNull: true },
            mailCorporate: { type: Sequelize.STRING(1000), allowNull: true },
            contactAssurancePhase2FirstName: { type: Sequelize.STRING, allowNull: true },
            contactAssurancePhase2LastName: { type: Sequelize.STRING, allowNull: true },            
            contactAssurancePhase2Phone: { type: Sequelize.STRING(1000), allowNull: true },
            contactAssurancePhase2Mail: { type: Sequelize.STRING(2000), allowNull: true },
            contactAssurancePhase3FirstName: { type: Sequelize.STRING, allowNull: true },
            contactAssurancePhase3LastName: { type: Sequelize.STRING, allowNull: true },
            contactAssurancePhase3Phone: { type: Sequelize.STRING(1000), allowNull: true },            
            contactAssurancePhase3Mail: { type: Sequelize.STRING(2000), allowNull: true },
            contactAssurancePhase3Service: { type: Sequelize.STRING(1000), allowNull: true },            
            serviceProtocol: { type: Sequelize.STRING(1000), allowNull: true },
            serviceDns: { type: Sequelize.STRING(1000), allowNull: true },
            servicePort: { type: Sequelize.STRING, allowNull: true },
            serviceContext: { type: Sequelize.STRING(1000), allowNull: true },
            serviceComponent: { type: Sequelize.STRING(1000), allowNull: true },
            serviceOperator: { type: Sequelize.STRING(1000), allowNull: true },
            serviceFileType: { type: Sequelize.STRING(1000), allowNull: true },
            serviceFileName: { type: Sequelize.STRING(1000), allowNull: true },
            serviceUrl: { type: Sequelize.STRING(1000), allowNull: true },
            serviceCertificates: { type: Sequelize.STRING(1000), allowNull: true },           
            serviceClientType: { type: Sequelize.STRING(1000), allowNull: true },
            serviceIP: { type: Sequelize.STRING, allowNull: true },
            serviceNote: { type: Sequelize.STRING(2000), allowNull: true },
            objData: { type: Sequelize.JSON, allowNull: true },
        }, {
            sequelize,
            modelName: 'olo2Olo',
            tableName: 'olo2Olo'
        });

        Locality.init({
            postalcode: { type: Sequelize.STRING, allowNull: false }, //pcap        
            countrycode: { type: Sequelize.STRING, allowNull: false }, //contry code IT for Italy
            city: { type: Sequelize.STRING, allowNull: true },  //comune
            adm1: { type: Sequelize.STRING, allowNull: true },  //province
            adm1code: { type: Sequelize.STRING, allowNull: true },  //province code
            adm2: { type: Sequelize.STRING, allowNull: true },  //region
            adm2code: { type: Sequelize.STRING, allowNull: true },  //region code
            latitude: { type: Sequelize.FLOAT, defaultValue: 0 },
            longitude: { type: Sequelize.FLOAT, defaultValue: 0 },
            accuracy: { type: Sequelize.STRING, allowNull: true },
            objdata: { type: Sequelize.JSON, defaultValue: "" },
        }, {
            sequelize,
            modelName: 'locality'
        });

        InternetServiceLevel.init({
            xCoord: { type: Sequelize.FLOAT, allowNull: true },       //latitude        
            yCoord: { type: Sequelize.FLOAT, allowNull: true },       //logintude
            gridId100m: { type: Sequelize.STRING, allowNull: true },    //grid100
            serviceType: { type: Sequelize.STRING, allowNull: true },   //ADSL, FTTC
            nAdress: { type: Sequelize.STRING, allowNull: true },       //numero indirizzi
            speedDown: { type: Sequelize.STRING, allowNull: true },     //download
            speedUp: { type: Sequelize.STRING, allowNull: true },       //upload
            coverage: { type: Sequelize.STRING, allowNull: true },      //copertura            
        }, {
            sequelize,
            modelName: 'internetServiceLevel'
        });

        Config.init({
            key: { type: Sequelize.STRING, allowNull: true },    //key section config
            value: { type: Sequelize.BLOB, allowNull: true },  //JSON configuration     
        }, {
            sequelize,
            modelName: 'config'
        });

        //Associations
        Customer.hasMany(Contract);
        Contract.hasMany(DeviceCustomer);
        ServiceTemplate.hasMany(ContractService);
        Contract.hasMany(ContractService);
        Contract.hasMany(Invoice);
        Invoice.hasMany(InvoiceEntry);
        ContractService.hasMany(InvoiceEntry);

        Contract.belongsTo(Customer);
        DeviceCustomer.belongsTo(Contract);
        DeviceCustomer.belongsTo(Customer);
        ContractService.belongsTo(Contract);
        ContractService.belongsTo(ServiceTemplate);
        Invoice.belongsTo(Contract);
        InvoiceEntry.belongsTo(Invoice);
        InvoiceEntry.belongsTo(ContractService);

        DeviceBackbone.belongsTo(SiteBackbone);

        //Table Creation and Sync        
        Customer.sync({ force: false });
        Contract.sync({ force: false });
        ServiceTemplate.sync({ force: false });
        ContractService.sync({ force: false });
        DeviceCustomer.sync({ force: false });
        DeviceBackbone.sync({ force: false });
        SiteBackbone.sync({ force: false });
        Invoice.sync({ force: false });
        InvoiceEntry.sync({ force: false });
        


        //Tabelle da non modificare. Dati Fissi.
        Config.sync({ force: false });
        User.sync({ force: false });
        Locality.sync({ force: false });
        InternetServiceLevel.sync({ force: false });
        Olo2Olo.sync({ force: false });
    },
    execute_raw_query(sql, callback) {
        this.seq.query(sql, { type: QueryTypes.SELECT }).then(results => {
            callback(results);
        });
    },


    //////////////////////////////Entities functions ///////////////////
    saveContract(contract, callback) {
        contract.save().then((ctrupdate) => {
            ///Find all service contract
            this.entities.contractService.findAll({ where: { contractId: ctrupdate.id } }).then((services) => {
                if (services)
                    services.forEach((ctrServ, indexServ, arrayServ) => {
                        ctrServ.state = contract.state;
                        ctrServ.save().then((ctrServUpt) => {
                            if (indexServ === arrayServ.length - 1) {
                                //Update staete of devices
                                this.entities.deviceCustomer.findAll({ where: { contractId: ctrupdate.id } }).then((devices) => {
                                    if (devices)
                                        devices.forEach(function (dev, indexDev, arrayDev) {
                                            dev.state = contract.state;
                                            dev.save().then((devUpt) => {
                                                if (indexDev === arrayDev.length - 1)
                                                    callback(ctrupdate);
                                            });
                                        });
                                });
                            }
                        });
                    });
            });
        });
    },

    getCustomerContracts(customer, callback) {
        this.entities.contract.findAll({ where: { customerId: customer.id } }).then((contracts) => {
            callback(contracts);
        });
    }

}