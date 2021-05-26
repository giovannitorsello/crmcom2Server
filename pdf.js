const config = require("./config.js").load();
const PDFDocument = require('pdfkit');
const pdftk = require('node-pdftk');
const fs = require('fs');
var dateFormat = require("dateformat");

module.exports = {
    app: {},
    database: {},
    startServer(app, db) {
        this.app = app;
        this.database = db;
    },
    createIdentidyDocumentsPage(customer, callback) {
        var baseProcessPath=process.cwd();
        const fileName = baseProcessPath+config.paths.tempFolder + "IdentDoc-" + customer.uuid + ".pdf";
        const doc = new PDFDocument;
        doc.pipe(fs.createWriteStream(fileName));        
        //Load images
        var imageCiFront = baseProcessPath+config.paths.customer_identity_document + "CiFront-" + customer.uuid + ".jpg"
        var imageCiBack = baseProcessPath+config.paths.customer_identity_document + "CiBack-" + customer.uuid + ".jpg"
        var imageCfFront = baseProcessPath+config.paths.customer_identity_document + "CfFront-" + customer.uuid + ".jpg"
        var imageCfBack = baseProcessPath+config.paths.customer_identity_document + "CfBack-" + customer.uuid + ".jpg"

        // Add an image, constrain it to a given size, and center it vertically and horizontally
        var docWidth = 250;
        var spacing = docWidth * (350 / 600) + 30;
        doc.image(imageCiFront, 30, 30, { width: docWidth }).text('Carta di identità fronte', 30, 20);
        doc.image(imageCiBack, 30, 30 + spacing, { width: docWidth }).text('Carta di identità retro', 30, 20 + spacing);
        doc.image(imageCiFront, 30, 30 + 2 * spacing, { width: docWidth }).text('Codice fiscale fronte', 30, 20 + 2 * spacing);
        doc.image(imageCiBack, 30, 30 + 3 * spacing, { width: docWidth }).text('Codice fiscale retro', 30, 20 + 3 * spacing);

        // Finalize PDF file
        doc.end();

        if (fs.existsSync(fileName))
            callback();
        else
            console.log("Error in creating pdf document identity page");
    },
    compileContractTemplate(customer, contract, callback) {
        var baseProcessPath=process.cwd();
        var formToFillTemplate = baseProcessPath+config.paths.documentsTemplateFolder + "GeneralContractTemplate.pdf";
        var identityDocuments = baseProcessPath+config.paths.tempFolder + "IdentDoc-" + customer.uuid + ".pdf";
        var filledContract = baseProcessPath+config.paths.tempFolder + "contract-" + customer.uuid + ".pdf";
        var finalDocument = baseProcessPath+config.paths.contractsFolder + "contract-" + customer.uuid + ".pdf";
        var finalDocumentLocalPath = config.paths.contractsFolder + "contract-" + customer.uuid + ".pdf";

        var customerName = "";
        var customer_address = "";
        var customer_phone = "";
        var activationDate=dateFormat(new Date(), "dd/mm/yyyy");
        //azienda
        if(customer.vatcode) {
            customerName = customer.company;
            customer_address = customer.companyaddress;
            customer_phone = customer.companyphone;            
        }
        //privato
        if(!customer.vatcode && customer.codfis) {
            customerName = customer.firstname+" "+customer.lastname;
            customer_address = customer.address;
            customer_phone = customer.mobilephone;            
        }

        pdftk
            .input(formToFillTemplate)
            .fillForm({
                activationDate: activationDate,
                clientCode: customer.uuid,
                customerName: customerName,
                fiscalCode: customer.codfis,
                phone: customer_phone,
                fax: customer_phone,
                customerAddress: customer_address,
                customerCap: customer.postcode,
                customerCity: customer.city,
                customerProvince: contract.invoiceProvince,
                customerIdentityCardNumber: customer.numci,
                customerEmail: customer.email,
                customerInternalContact: customerName,
                customerInternalContactPhone: customer.phone,
                invoiceContact: customerName,
                invoiceAddress: contract.invoiceAddress,
                invoiceCap: contract.invoiceCAP,
                invoiceCity: contract.city,
                invoiceProvince: contract.invoiceProvince,
                priceOneTimeActivation: contract.objData.valueSelectedServices.activationPrice,
                priceMonthlyFee: contract.objData.valueSelectedServices.total,
                note: contract.note,
                contractSignCity: contract.invoiceCity,
                contractSignDate: activationDate,
                signantureClient: contract.signature,
                sendByTraditionalMail: false
            })
            .flatten()
            .output(filledContract)
            .then(buffer => {
                pdftk
                    .input({
                        A: fs.readFileSync(filledContract),
                        B: fs.readFileSync(identityDocuments),
                    })
                    .cat('A B')
                    .output(finalDocument)
                    .then(buffer => {
                        callback(finalDocumentLocalPath)
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    }


}