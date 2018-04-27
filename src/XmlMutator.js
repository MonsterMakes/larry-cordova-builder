'use strict';
const PromiseUtils = require("./PromiseUtils");
const _ = require("lodash");
const xml2js = require('xml2js');
const jsonPatch = require("fast-json-patch");
const baseXmlConfig = require("./BaseXmlConfig");

class XmlMutator{
    constructor(baseXml=baseXmlConfig,mutations=[]){
        this._baseXml = baseXml;
        this._mutations = mutations;
    }
    _parseXml(xmlStr){
        return Promise.resolve()
            .then(()=>{
                if(!xmlStr){
                    return Promise.resolve({});
                }            
                else{
                    return new Promise((resolve,reject)=>{
                        var parser = new xml2js.Parser({
                            // emptyTag: [],
                            // explicitChildren: true
                        });
                        parser.parseString(xmlStr, function(err,result){
                            if(err){
                                console.error("Config.xmlWriter._parseXml could NOT parse string\n",xmlStr)
                                reject("Tried to parse an invalid xml string");
                            }
                            else{   
                                resolve(result);
                            }
                        });
                    });
                }
            });
    }
    _buildXml(xmlObj,options){
        let opts = _.merge({},
            {
                xmldec: {
                    version: '1.0',
                    encoding: 'UTF-8'
                },
                renderOpts: { 
                    pretty: true, 
                    indent: '\t', 
                    newline: '\n',
                    allowEmpty: true
                }
            },
            options
        );
        let builder = new xml2js.Builder(opts);
        let xmlStr = builder.buildObject(xmlObj);
        return xmlStr;
    }
    /**
     * 
     * @param {XmlMutationObject} mutations -
     */
    build(){
        let xmlObj;
        return Promise.resolve()
            //starting from a base xml string
            .then(()=>{
                return this._parseXml(this._baseXml);
            })
            .then((baseXmlObj)=>{
                xmlObj = _.cloneDeep(baseXmlObj);
                return PromiseUtils.serial(this._mutations,(allProm,mutation,currentIndex)=>{            
                    return allProm.then(()=>{
                        let prom = Promise.resolve();
                        //custom sauce mutation
                        if(_.isFunction(mutation)){
                            try{
                                let returnVal = mutation.call(this,xmlObj);
                            }
                            catch(e){
                                prom = Promise.reject(e);
                            }
                        }
                        //jsonPatch mutation
                        else if(_.isPlainObject(mutation)){
                            try{
                                //make sure the path exists
                                if(mutation.hasOwnProperty("path")){
                                    let lodashSelector = mutation.path.replace(/\//ig,'.');
                                    lodashSelector = lodashSelector.replace(/\.-/ig,'');
                                    lodashSelector = lodashSelector.slice(1);
                                    _.set(xmlObj,lodashSelector,{});
                                }
                                let results = jsonPatch.applyOperation(xmlObj,mutation);
                            }
                            catch(e){
                                prom = Promise.reject(e);
                            }
                        }
                        else if(_.isString(mutation)){
                            //TODO this is a mapping to mutations larry-core???
                        }
                        //Unknown mutation type
                        else{
                            //need logging
                            let errMsg = `A mutation was found but is NOT a string or a mutation function.`;
                            console.error(errMsg);
                            prom = Promise.reject(errMsg);
                        }
                        return prom;
                    });
                });
            })
            .then(()=>{
                return this._buildXml(xmlObj);
            });
    }
}
module.exports=XmlMutator;