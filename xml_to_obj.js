/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var fs = require('fs');
var convert = require('xml-js');
var get_element_field = require('./parse_general').get_element_field;
var element_to_obj = require('./parse_general').element_to_obj;


exports.import=function(file_xml, callback){
    
    var invoices=[];
    var company={};
    
    fs.readFile(file_xml, "UTF-8", function (err, xml){
        if (err) {
            return console.log(err);
        }
        
        var obj_string=convert.xml2json(xml, {compact: false, spaces: 1});
        obj=JSON.parse(obj_string);
        fs.writeFile("./uploads/fatture.import", obj_string, function(err) {
            if(err) {
                return console.log(err);
            }
            
            
            console.log("The file was saved!");
            
            EF_documents=get_element_field(obj.elements,"EasyfattDocuments");
            Company=get_element_field(EF_documents.elements, "Company");
            Documents=get_element_field(EF_documents.elements, "Documents");
                        
            company=element_to_obj(Company);
                        
            Documents.elements.forEach(function (element){
                invoice=element_to_obj(element);
                invoices.push(invoice);            
            });
            
            callback(company, invoices); 
        }); 
        
    });
};