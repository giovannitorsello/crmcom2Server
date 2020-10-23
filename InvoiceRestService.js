const config = require("./config.js");
var pdfKit = require('pdfkit');
var moment = require('moment');
var numeral = require('numeral');
var dateFormat = require('dateformat');

var utility = require("./utility.js");
//const pdfInvoice = require('pdf-invoice');
const fs = require('fs');
const blobStream = require('blob-stream');
const danea_xml_import=require("./daneaXMLImport");

const company=config.company;
//Constants for export invoice in pdf
const TEXT_SIZE = 10;
const TEXT_SIZE_COMPANY_DATA = 8;
const TEXT_SIZE_ITEMS = 8;
const TEXT_SIZE_REPORT = 8;
const TEXT_SIZE_PAYMENT = 8;
const HEADER_HEIGHT = 200;
const PAGE_MARGIN={top: 20, left: 20, right: 20, bottom: 20};
const LOGO_WIDTH=300;
const TABLE_COLUMN_WIDTH=100;

var xpos=PAGE_MARGIN.right;
var ypos=PAGE_MARGIN.top;
//Finish constants pdf

function printInvoiceByTemplate(invoice_obj) {

  var doc = new pdfKit({ size: 'A4', margin: PAGE_MARGIN });
  doc.fillColor('#333333');
  var doc_width=doc.page.width;
  var doc_height=doc.page.height;

  //print date filgrane
  doc.fontSize(5);
  doc.fillColor('#333333');
  doc.text("Stampato il "+moment().format('MM/DD/YYYY'), 300, 5, { align: 'right' });
 
  //logo
  ypos=PAGE_MARGIN.top;
  xpos=PAGE_MARGIN.left;
  var pdfLogImage=doc.image('images/logo.jpg', xpos, ypos, {width: LOGO_WIDTH});


  //header
  xpos+= LOGO_WIDTH+10;
  doc.fillColor('#333333');
  doc.font('Helvetica-Bold');
  doc.fontSize(20);
  doc.text(company.name, xpos, ypos);
  
  ypos+=doc.currentLineHeight();
  doc.font('Times-Roman');
  doc.fontSize(TEXT_SIZE_COMPANY_DATA);  
  doc.text(company.address, xpos, ypos, {width: 300});
  ypos+=doc.currentLineHeight();
  doc.text("Telefono: "+company.phone, xpos, ypos, {width: 300});
  ypos+=doc.currentLineHeight();
  doc.text("Email: "+company.email, xpos, ypos, {width: 300});
  ypos+=doc.currentLineHeight();
  doc.text("Pec: wifinetcomsrl@certiposta.net", xpos, ypos, {width: 300});
  ypos+=doc.currentLineHeight();
  doc.text("Sito: http://www.wifinetcom.net", xpos, ypos, {width: 300});
  ypos+=doc.currentLineHeight();
  doc.text("C.F./P.Iva 04758360756 Reg. imprese REA: LE - 316124", xpos, ypos, {width: 300});
  ypos+=doc.currentLineHeight();
  
  doc.lineCap('butt').moveTo(PAGE_MARGIN.left+LOGO_WIDTH+10, ypos).lineTo(doc_width-PAGE_MARGIN.right, ypos).stroke();
  //Finish header  


  //Invoice infos
  ypos=HEADER_HEIGHT;
  xpos=PAGE_MARGIN.left;
  doc.fontSize(TEXT_SIZE); 
  var invoice_date=new Date(invoice_obj.Date);
  doc.text("Fattura n.: "+invoice_obj.Number + 
                        '/' + invoice_obj.Numbering +
                        '  del  ' + dateFormat("dd/mm/yyyy"), 
                        PAGE_MARGIN.left, ypos);
  
  ypos+=2*doc.currentLineHeight();
  doc.lineCap('butt').moveTo(PAGE_MARGIN.left, ypos).lineTo(doc_width-PAGE_MARGIN.right, ypos).stroke();
  //Finish invoice infos
  
  //Customers infos
  ypos+=4*doc.currentLineHeight();
  doc.text("Destinatario:", xpos, ypos);
  ypos+=doc.currentLineHeight();
  doc.text(invoice_obj.CustomerName, xpos, ypos);
  ypos+=doc.currentLineHeight();
  doc.text(invoice_obj.CustomerAddress + 
            ', CAP ' + invoice_obj.CustomerPostcode + 
            ', '+invoice_obj.data.CustomerCity+
            ', ['+invoice_obj.data.CustomerProvince+']'+
            ', '+invoice_obj.data.CustomerCountry,
            xpos, ypos);
  
  ypos+=doc.currentLineHeight();
  doc.text("Telefono: " +invoice_obj.data.CustomerTel, xpos, ypos);
  ypos+=doc.currentLineHeight();
  doc.text("Mobile: " + invoice_obj.data.CustomerCellPhone, xpos, ypos);
  if(invoice_obj.CustomerEmail!=null) {
    ypos+=doc.currentLineHeight();
    doc.text("Email: "+invoice_obj.CustomerEmail, xpos, ypos);
  }
    
  if(invoice_obj.CustomerFiscalCode!=null) {
    ypos+=doc.currentLineHeight();
    doc.text("Codice fiscale: "+invoice_obj.CustomerFiscalCode, xpos, ypos);
  }
    
  if(invoice_obj.CustomerVatCode!=null) {
    ypos+=doc.currentLineHeight();
    doc.text("Partita IVA: "+invoice_obj.CustomerVatCode, xpos, ypos);
  }
    
  ypos+=2*doc.currentLineHeight();
  doc.lineCap('butt').moveTo(PAGE_MARGIN.left, ypos).lineTo(doc_width-PAGE_MARGIN.right, ypos).stroke();
  //End customer infos
  
  //Invoice elements detail
  //Tables headers
  ypos+=4*doc.currentLineHeight();
  var tableHeaderDescriptionFields=['Descrizione', 'Quantità', 'Prezzo', 'IVA', 'Totale'];
  tableHeaderDescriptionFields.forEach(function (text, i) {
    doc.fontSize(TEXT_SIZE_ITEMS).text(text, xpos + i * TABLE_COLUMN_WIDTH, ypos);
  });
  //Tables items
  doc.fontSize(TEXT_SIZE_ITEMS);
  ypos+=doc.currentLineHeight();
  var items=invoice_obj.data.Rows;  
  for(var propt in items){
    xpos=PAGE_MARGIN.left;
    ypos+=1.5*doc.currentLineHeight();
    if(propt==="Row"){      
      var item_row=items[propt];
      doc.text(item_row["Description"], xpos , ypos, {width: 100}); xpos+=TABLE_COLUMN_WIDTH;
      doc.text(item_row["Qty"], xpos , ypos);                       xpos+=TABLE_COLUMN_WIDTH;
      doc.text(item_row["Price"], xpos , ypos);                     xpos+=TABLE_COLUMN_WIDTH;
      doc.text(item_row["VatCode"], xpos , ypos);                   xpos+=TABLE_COLUMN_WIDTH;
      doc.text(item_row["Total"], xpos , ypos);
    }      
  }
  ypos+=3*doc.currentLineHeight();
  doc.lineCap('butt').moveTo(PAGE_MARGIN.left, ypos).lineTo(doc_width-PAGE_MARGIN.right, ypos).stroke();  
  //Finish invoice details
  

  //Totali fattura
  //Tables invoice totals
  ypos+=4*doc.currentLineHeight();
  var tableHeaderDescriptionFields=['Aliquota IVA', 'Imponibile', 'Imposta'];
  doc.fontSize(TEXT_SIZE);
  xpos=PAGE_MARGIN.left;
  tableHeaderDescriptionFields.forEach(function (text, i) {
    doc.text(text, xpos + i * TABLE_COLUMN_WIDTH, ypos);
  });
  ypos+=1.5*doc.currentLineHeight();
  
  doc.text(invoice_obj.data.CostVatCode, xpos , ypos);      xpos+=TABLE_COLUMN_WIDTH;
  doc.text(invoice_obj.data.TotalWithoutTax, xpos , ypos);  xpos+=TABLE_COLUMN_WIDTH;
  doc.text(invoice_obj.data.VatAmount, xpos , ypos);        xpos+=TABLE_COLUMN_WIDTH;
 
  ypos+=2*doc.currentLineHeight();
  doc.lineCap('butt').moveTo(PAGE_MARGIN.left, ypos).lineTo(doc_width-PAGE_MARGIN.right, ypos).stroke();
  
  ypos+=2*doc.currentLineHeight();
  xpos=300;
  doc.fontSize(14).text("Totale documento: " + invoice_obj.data.Total +" €", xpos , ypos)
  
  ypos+=4*doc.currentLineHeight();
  doc.fontSize(10);
  doc.text("PaymentName: " + invoice_obj.data.PaymentName, PAGE_MARGIN.left, ypos)
  //Istituto bancario
  if(Object.keys(invoice_obj.data.PaymentBank).length !== 0 && invoice_obj.data.PaymentBank.constructor === Object)
  {
    ypos+=doc.currentLineHeight();
    doc.text("Istituto bancario: " + invoice_obj.data.PaymentBank, PAGE_MARGIN.left, ypos);
  }
  //footer
  var str_footer="Ai sensi del D.Lgs. 196/2003 Vi informiamo che i Vs. dati saranno utilizzati esclusivamente per i fini connessi ai rapporti commerciali tra di noi in essere. "+
                "Contributo CONAI assolto ove dovuto - Vi preghiamo di controllare i Vs. dati anagrafici, la P. IVA e il Cod. Fiscale. Non ci riteniamo responsabili di eventuali errori."

  doc.fontSize(6);
  xpos=PAGE_MARGIN.left;
  ypos=doc_height-4*PAGE_MARGIN.bottom-2*doc.currentLineHeight();
  doc.text(str_footer, xpos, ypos, {width: doc_width-PAGE_MARGIN.right, align: "left", valign:"bottom"});
                  
  //console.log(invoice_obj.data);

  doc.end();

  return doc;
}

module.exports = {
  getInvoices(req, res, invoiceObjDb) {
    var obj=req.body;      
    invoiceObjDb.find(obj, function (err, list) {
      if (err) res.send({ status: "error", err: err });
      else {
        //console.log(JSON.stringify(list));
        res.send({ status: "success", invoices: JSON.stringify(list) });
      }
    });
  },

  printInvoice(req, res, invoiceObjDb) {
    var body_req = req.body;
    var invoice = body_req.invoice;    
    console.log("Render pdf invoice wait...")
    var document = printInvoiceByTemplate(invoice);
    var invoice_date=dateFormat(new Date(invoice.Date),"yyyymmdd");
    var filename_invoice=(new Date()).getTime()+"_"+invoice.Number+invoice_date+".pdf";
    console.log(filename_invoice);    
    var filename_cache = "."+config.server.cachefolder+"/"+filename_invoice;
    var filenameURL = "http://"+config.server.hostname+":"+config.server.port+"/static/"+filename_invoice;
    var stream = fs.createWriteStream(filename_cache)
    document.pipe(stream);
    res.send({ filePdfUrl: filenameURL });
  },

  uploadInvoicesFromDaneaXml(req, res, invoiceObjDb, customerObjDb){
    danea_xml_import.import_xml_from_danea_invoices(req,res,invoiceObjDb,customerObjDb);
    console.log("Begin import from Danea Easy Fact");
  },

  invoiceStore(req, res, invoiceObjDb) {

  },

  invoiceDelete(req, res, invoiceObjDb) {

  },

  invoiceFind(req, res, invoiceObjDb) {
    var obj = req.obj;
    console.log("Search"); 
    invoiceObjDb.find(obj, function (err, list) {
      if (err) res.send({ status: "error", err: err });
      else {
        //console.log(JSON.stringify(list));
        res.send({ status: "success", invoices: JSON.stringify(list) });
      }
    });
  }

}


function Find(obj, invoiceObjDb, cb) {
  invoiceObjDb.find(obj, function (err, invoices) {
    cb(invoices);
  });
}

function Remove(obj, invoiceObjDb, cb) {
  invoiceObjDb.find({ invoiceFiscalCode: obj.invoiceFiscalCode }).remove(function (err) {
    if (err) { console.log("Error in deleting invoice");}
    // success
  });
}

/*
function InsertUpdate(obj, invoiceObjDb, cb) {
  invoiceObjDb.find(obj, function (err, invoices) {
    if (err) throw err;
    if (invoices.length === 0) { //no result in database -> insert new invoice in database
      console.log("Create new invoice");
      console.log(obj);      
    }
    if (invoices.length === 1) {
      invoiceObjDb.save(obj, function (err) {
        if (err) throw err;
        console.log("Update new invoice");
        console.log(obj);
        //cb();
      });
    }
    if (invoices.length > 1) { console.log("Error duplicate invoice"); }
  }); //find end
}
*/