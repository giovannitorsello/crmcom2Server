const config = require("./config.js").load();
const PDFDocument = require("pdfkit");
const pdftk = require("node-pdftk");
const fs = require("fs");
var dateFormat = require("dateformat");

module.exports = {
  app: {},
  database: {},
  startServer(app, db) {
    this.app = app;
    this.database = db;
  },
  createIdentidyDocumentsPage(customer, callback) {
    var baseProcessPath = process.cwd();
    const fileName =
      baseProcessPath +
      config.paths.tempFolder +
      "IdentDoc-" +
      customer.uuid +
      ".pdf";
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(fileName));
    //Load images
    var imageCiFront=baseProcessPath+config.paths.customer_identity_document+"CiFront-"+customer.uuid+".jpg";
    var imageCiBack=baseProcessPath+config.paths.customer_identity_document+"CiBack-"+customer.uuid+".jpg";
    var imageCfFront=baseProcessPath+config.paths.customer_identity_document+"CfFront-"+customer.uuid+".jpg";
    var imageCfBack=baseProcessPath+config.paths.customer_identity_document+"CfBack-"+customer.uuid+".jpg";

    // Add an image, constrain it to a given size, and center it vertically and horizontally
    var docWidth = 250;
    var spacing = docWidth * (350 / 600) + 30;
    doc
      .image(imageCiFront, 30, 30, { width: docWidth })
      .text("Carta di identità fronte", 30, 20);
    doc
      .image(imageCiBack, 30, 30 + spacing, { width: docWidth })
      .text("Carta di identità retro", 30, 20 + spacing);
    doc
      .image(imageCfFront, 30, 30 + 2 * spacing, { width: docWidth })
      .text("Codice fiscale fronte", 30, 20 + 2 * spacing);
    doc
      .image(imageCfBack, 30, 30 + 3 * spacing, { width: docWidth })
      .text("Codice fiscale retro", 30, 20 + 3 * spacing);

    // Finalize PDF file
    doc.end();

    if (fs.existsSync(fileName)) callback();
    else console.log("Error in creating pdf document identity page");
  },
  compileContractTemplate2(customer, contract, callback) {
    const pdfServer = this;
    var baseProcessPath = process.cwd();
    var formToFillTemplate =
      baseProcessPath +
      config.paths.documentsTemplateFolder +
      "GeneralContractTemplate.pdf";
    var documentInfo =
      baseProcessPath +
      config.paths.documentsTemplateFolder +
      "GeneralContractTemplate.json";
    var identityDocuments =
      baseProcessPath +
      config.paths.tempFolder +
      "IdentDoc-" +
      customer.uuid +
      ".pdf";

    var filledContract =
      baseProcessPath +
      config.paths.tempFolder +
      "contract-" +
      customer.uuid +
      ".pdf";
    var finalDocument =
      baseProcessPath +
      config.paths.contractsFolder +
      "contract-" +
      customer.uuid +
      ".pdf";
    var finalDocumentLocalPath =
      config.paths.contractsFolder + "contract-" + customer.uuid + ".pdf";
    var signatureFile =
      baseProcessPath + config.paths.signaturesFolder + customer.uuid + ".png";

    var customerName = "";
    var customer_address = "";
    var customer_phone = "";
    var activationDate = dateFormat(new Date(), "dd/mm/yyyy");
    //azienda
    if (customer.vatcode) {
      customerName = customer.company;
      customer_address = customer.companyaddress;
      customer_phone = customer.companyphone;
    }
    //privato
    if (!customer.vatcode && customer.codfis) {
      customerName = customer.firstname + " " + customer.lastname;
      customer_address = customer.address;
      customer_phone = customer.mobilephone;
    }

    //read document info
    if (fs.existsSync(documentInfo))
      docInfo = JSON.parse(fs.readFileSync(documentInfo));
    else docInfo = {};

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
        priceOneTimeActivation:
          contract.objData.valueSelectedServices.activationPrice,
        priceMonthlyFee: contract.objData.valueSelectedServices.total,
        note: contract.note,
        contractSignCity: contract.invoiceCity,
        contractSignDate: activationDate,
        signantureClient: signatureFile,
        sendByTraditionalMail: false,
      })
      .flatten()
      .output(filledContract)
      .then((buffer) => {
        pdftk
          .input({
            A: fs.readFileSync(filledContract),
            B: fs.readFileSync(identityDocuments),
          })
          .cat("A B")
          .output(finalDocument)
          .then((buffer) => {
            //Add signature
            pdfServer.signContract(
              finalDocument,
              signatureFile,
              docInfo,
              callback
            );
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  async compileContractTemplate(customer, contract, callback) {
    const pdfServer = this;
    var baseProcessPath=process.cwd();

    //Template documents files
    var formToFillTemplate=baseProcessPath+config.paths.documentsTemplateFolder+"GeneralContractTemplate.pdf";
    var documentInfo=baseProcessPath+config.paths.documentsTemplateFolder+"GeneralContractTemplate.json";
    
    //Personal documents files
    var imageCiFront=baseProcessPath+config.paths.customer_identity_document+"CiFront-"+customer.uuid+".jpg";
    var imageCiBack=baseProcessPath+config.paths.customer_identity_document+"CiBack-"+customer.uuid+".jpg";
    var imageCfFront=baseProcessPath+config.paths.customer_identity_document+"CfFront-"+customer.uuid+".jpg";
    var imageCfBack=baseProcessPath+config.paths.customer_identity_document+"CfBack-"+customer.uuid+".jpg";
    var signatureFile=baseProcessPath+config.paths.signaturesFolder+customer.uuid+".png";

    //Output files
    var filledContract=baseProcessPath+config.paths.tempFolder+"contract-"+customer.uuid+".pdf";
    var finalDocument=baseProcessPath+config.paths.contractsFolder+"contract-"+customer.uuid+".pdf";
    var finalDocumentLocalPath=config.paths.contractsFolder+"contract-"+customer.uuid+".pdf";
    

    var customerName = "";
    var customer_address = "";
    var customer_phone = "";
    var activationDate = dateFormat(new Date(), "dd/mm/yyyy");
    //azienda
    if (customer.vatcode) {
      customerName = customer.company;
      customer_address = customer.companyaddress;
      customer_phone = customer.companyphone;
    }
    //privato
    if (!customer.vatcode && customer.codfis) {
      customerName = customer.firstname + " " + customer.lastname;
      customer_address = customer.address;
      customer_phone = customer.mobilephone;
    }

    //read document info
    if (fs.existsSync(documentInfo))
      docInfo = JSON.parse(fs.readFileSync(documentInfo));
    else docInfo = {};

    //Fill form
    const { PDFDocument } = require("pdf-lib");
    const pdfDoc = await PDFDocument.load(fs.readFileSync(formToFillTemplate));
    const form = pdfDoc.getForm() 
    const dataForm={
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
        //sendByTraditionalMail: false,
    }
    const fieldNames = Object.keys(dataForm);
    for (i=0;i<fieldNames.length;i++) {
        var fieldName=fieldNames[i];
        var fieldValue=dataForm[fieldName];
        const formField = form.getTextField(fieldName);
        formField.setText(fieldValue);
    }
    
    //Sign document
    const img = await pdfDoc.embedPng(fs.readFileSync(signatureFile));
    if (docInfo.signatureImages) {
        for(var i=0;i<docInfo.signatureImages.length; i++) {
            var page = docInfo.signatureImages[i].page;
            var xpos = docInfo.signatureImages[i].xpos;
            var ypos = docInfo.signatureImages[i].ypos;
            var height = docInfo.signatureImages[i].height;

            var imagePage = pdfDoc.getPage(page);
            var calc_xpos = xpos;
            var calc_ypos = imagePage.getHeight() - height - ypos;
            var calc_width = (height / img.height) * img.width;
            var calc_height = height;

            imagePage.drawImage(img, {
            x: calc_xpos,
            y: calc_ypos,
            width: calc_width,
            height: calc_height,
            });
            
        }
    }

    imagePage=pdfDoc.addPage();
    var imgCiFront = await pdfDoc.embedJpg(fs.readFileSync(imageCiFront));
    var imgCiBack = await pdfDoc.embedJpg(fs.readFileSync(imageCiBack));
    var imgCfFront = await pdfDoc.embedJpg(fs.readFileSync(imageCfFront));
    var imgCfBack = await pdfDoc.embedJpg(fs.readFileSync(imageCfBack));
    var docWidth = 250;
    var spacing = docWidth * (350 / 600) + 30;
    var calc_width = docWidth;
    var calc_height = 350;
    imagePage.drawImage(imgCiFront, {
        x: 30,
        y: 30,
        width: calc_width,
        height: calc_height,
        });
    imagePage.drawImage(imgCiBack, {
        x: 30,
        y: 20 + spacing,
        width: calc_width,
        height: calc_height,
        });
    imagePage.drawImage(imgCfFront, {
        x: 30,
        y: 20 + 2 * spacing,
        width: calc_width,
        height: calc_height,
        });
    imagePage.drawImage(imgCfBack, {
        x: 30,
        y: 20 + 3 * spacing,
        width: calc_width,
        height: calc_height,
        });    

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(finalDocument, pdfBytes);

  },
  
};
