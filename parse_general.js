const config = require("./config.js").load();
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

exports.get_element_field = function(data, field_name) {
    var result={};
    data.forEach( function(element) {        
       if(element.name===field_name && element.type==="text") {result=element.text;} 
       if(element.name===field_name && element.type==="element") {result=element;}        
    });
    return result;
};

exports.element_to_obj = function(data) {
    var obj={};
    var name=data.name;
    var elements=data.elements;
    if(elements!==undefined)
    elements.forEach( function(element) {          
       if(element.type==="text") {obj=element.text;} 
       if(element.type==="element") 
       {
           var el=exports.element_to_obj(element);
           Object.defineProperty(obj, element.name, {value : el,
                               writable : true,
                               enumerable : true,
                               configurable : true});           
       }        
    });   
    return obj;
};
