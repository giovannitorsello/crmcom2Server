const config = require("./config.js").load();
var path = require('path');
var fs = require('fs');
var async = require("async");
var xml_to_obj = require('./xml_to_obj').import
var makeAuthenticationCode = require('./utility').makeAuthenticationCode

var n_invoices_new = 0;
var n_invoices_existing = 0;
var n_errors = 0;

var n_customers_new = 0;
var n_customers_existing = 0;


module.exports = {

    file: "fatture.DefXml",
    company: {},
    documents: [],
    buffer: "",
    Invoice: {},
    Customer: {},

    import_xml_from_danea_invoices: function (req, res, InvoiceDB, CustomerDB) {
        Invoice = InvoiceDB;
        Customer = CustomerDB;
        n_invoices_new = 0; n_invoices_existing = 0; n_errors = 0;
        if (!req.files) {
            res.send({ status: "upload_error", message: "no file present" });
        }
        var files = req.files;
        files.forEach(element => {
            let file = element;

            var oldpath = path.join(process.cwd(), file.path);
            var newpath = path.join(process.cwd(), file.path) + (new Date().toTimeString()) + ".xml";

            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                xml_to_obj(newpath, function (company, documents) {
                    console.log(company);
                    if (!company) return;
                    if (documents) console.log("Found " + documents.length + " invoices");

                    //callback needed for correct worling of async.each
                    var callback_async = function (err) {
                        if (!err) console.log("Invoice and customer stored");
                        else console.log("Data existing in DB");
                    };
                    async.each(documents,
                        function (item, callback_async) {
                            return InsertUpdateDBInvoices(item, InsertUpdateDBCustomers, callback_async);
                        },
                        function (err) {
                            if (err)
                            {
                                console.log("Managed error on import process");
                                //console.log(err);
                            }
                            update_ui(res);
                        });

                }); //parse xml end                
            }); //fs.rename end                    
        });
    }
}

function InsertUpdateDBInvoices(obj, callback_customer, callback_async) {
    Invoice.create({
        CustomerCode: obj.CustomerCode,
        CustomerName: obj.CustomerName,
        CustomerFiscalCode: obj.CustomerFiscalCode,
        CustomerVatCode: obj.CustomerVatCode,
        CustomerAddress: obj.CustomerAddress,
        CustomerPostcode: obj.CustomerPostcode,
        CustomerTel: obj.CustomerTel,
        CustomerCellPhone: obj.CustomerCellPhone,
        CustomerEmail: obj.CustomerEmail,
        Number: obj.Number,
        Numbering: obj.Numbering,
        Date: obj.Date,
        data: obj
    }, function (err) {
        if (!err) n_invoices_new++;
        else n_invoices_existing++;
        return callback_customer(obj, err, callback_async);
        //console.log("Insert invoice->" + n_invoices_new);                
    }); //create end
}


function InsertUpdateDBCustomers(obj, err, callback) {
    var date_now = new Date();
    if (obj.CustomerFiscalCode) username = obj.CustomerFiscalCode;
    else if (obj.CustomerVatCode) username = obj.CustomerVatCode;
    else username = date_now.getTime();
    password = obj.CustomerCode;
    Customer.create({
        CustomerCode: obj.CustomerCode,
        CustomerName: obj.CustomerName,
        CustomerFiscalCode: obj.CustomerFiscalCode,
        CustomerVatCode: obj.CustomerVatCode,
        CustomerAddress: obj.CustomerAddress,
        CustomerPostcode: obj.CustomerPostcode,
        CustomerProvince: obj.CustomerProvince,
        CustomerCity: obj.CustomerCity,
        CustomerCountry: obj.CustomerCountry,
        CustomerEmail: obj.CustomerEmail,
        CustomerCellPhone: obj.CustomerCellPhone,
        CustomerTel: obj.CustomerTel,
        CustomerSite: obj.CustomerSite,
        CustomerDateCreation: date_now,
        CustomerUsername: username,
        CustomerPassword: password,
    }, function (err) {
        if (!err) n_customers_new++;
        else n_customers_existing++;
        //console.log("Insert customer->" + obj.CustomerFiscalCode+"/"+obj.CustomerVatCode+" (" + n_customers_new);                
        return callback(err);
    }); //create end
}


function update_ui(res) {
    result = {
        "invoice_imported": n_invoices_new,
        "invoice_existing": n_invoices_existing,
        "customer_imported": n_customers_new,
        "customer_existing": n_customers_existing,
        "errors": n_errors
    };
    res.send(result);
}