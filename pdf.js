const PDFDocument = require('pdfkit');
const pdftk = require('node-pdftk');
const config = require('./config.js');
const fs = require('fs');

module.exports = {
    app: {},
    database: {},
    startServer(app, db) {
        this.app = app;
        this.database = db;
    },
    createIdentidyDocumentsPage(customer, callback) {
        const fileName = config.paths.tempFolder + "IdentDoc-" + customer.uuid + ".pdf";
        const doc = new PDFDocument;
        doc.pipe(fs.createWriteStream(fileName));

        //Load images
        var imageCiFront = config.paths.customer_identity_document + "CiFront-" + customer.uuid + ".jpg"
        var imageCiBack = config.paths.customer_identity_document + "CiBack-" + customer.uuid + ".jpg"
        var imageCfFront = config.paths.customer_identity_document + "CfFront-" + customer.uuid + ".jpg"
        var imageCfBack = config.paths.customer_identity_document + "CfBack-" + customer.uuid + ".jpg"

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
            console.log("Error in crating pdf document identity page");
    },
    compileContractTemplate(customer, contract, callback) {
        var formToFillTemplate = config.paths.documentsTemplateFolder + "GeneralContractTemplate.pdf";

        var identityDocuments = config.paths.tempFolder + "IdentDoc-" + customer.uuid + ".pdf";
        var filledContract = config.paths.tempFolder + "contract-" + customer.uuid + ".pdf";

        var finalDocument = config.paths.documentsFolder + "contract-" + customer.uuid + ".pdf";

        pdftk
            .input(formToFillTemplate)
            .fillForm({
                activationDate: '20/09/2020',
                clientCode: customer.uuid,
                customerName: "Giovanni Torsello",
                fiscalCode: 'TRSGNN73H26I549A',
                phone: '3939241987',
                fax: '3939241987',
                customerAddress: 'Via Pasubio n.33',
                customerCap: '73010',
                customerCity: 'Soleto',
                customerProvince: 'LE',
                customerIdentityCardNumber: "AA 111111",
                customerEmail: "aaa@bbb",
                customerInternalContact: 'Giovanni Torsello-2',
                customerInternalContactPhone: '3939241987-2',
                invoiceContact: 'Giovanni Torsello-3',
                invoiceAddress: 'Via Pasubio n.33-2',
                invoiceCap: '73010-2',
                invoiceCity: 'Soleto-2',
                invoiceProvince: 'Le-2',
                priceOneTimeActivation: '33.00',
                priceMonthlyFee: '25.0',
                note: 'Ciao prova di contratto',
                contractSignCity: 'Soleto',
                contractSignDate: '20/09/2020',
                sigantureClient: 'Giovanni Torsello',
                sendByTraditionalMail: true
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
                        callback(finalDocument)
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