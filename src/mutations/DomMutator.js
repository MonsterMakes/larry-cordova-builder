'use strict';
const Mutator = require("./Mutator");
const _ = require("lodash");
const JsDom = (require("jsdom")).JSDOM;
const xml2js = require('xml2js');
const vm = require('vm');

class DomMutator extends Mutator{
    constructor(baseXml='',mutations=[]){
        super(baseXml,mutations);
    }/*****************************************************************/
    /* START MUTATOR OVERRIDE METHODS */
    /*****************************************************************/
    _initializeBaseDocument(doc){
        return this._normalizeXml(doc)
            .then((normalized)=>{
                const dom = new JsDom(normalized,{
                    contentType: "text/xml"
                });
                return super._initializeBaseDocument(dom);
            });
    }
    _executeMutation(document,mutation){
        return Promise.resolve()
            .then(()=>{
                //dom mutation
                if(_.isPlainObject(mutation)){
                    try{
                        return this._executeDomManipulations(mutation.script);
                    }
                    catch(e){
                        return Promise.reject(e);
                    }
                }
                else{
                    return super._executeMutation(document,mutation);
                }
            });
    }
    _finalizeDocument(){
        return Promise.resolve()
            .then(()=>{
                let output = this._document.serialize();
                return this._normalizeXml(output)
            })
            .then((prettyXml)=>{
                return prettyXml;
            });
    }
    /*****************************************************************/
    /* END MUTATOR OVERRIDE METHODS */
    /* START PRIVATE METHODS
    /*****************************************************************/
    _normalizeXml(xmStr){
        return this._parseXml(xmStr)
            .then((parsed)=>{
                return this._buildXml(parsed);
            });
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
                        });
                        parser.parseString(xmlStr, function(err,result){
                            if(err){
                                console.error("DomMutator._parseXml could NOT parse string\n",xmlStr)
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
    _normalizeScript(scriptIn){
        let script = scriptIn;
        if(_.isArray(scriptIn)){
            script = scriptIn.join('');
        }
        return script;
    }
    _executeDomManipulations(scriptIn){
        return Promise.resolve()
            .then(()=>{
                let script = this._normalizeScript(scriptIn);
                vm.runInNewContext(script, this._document.window);
            });
    }
    _runScriptAgainstXmlDocument(document,scriptIn){
        let script = this._normalizeScript(scriptIn);

        const dom = new JsDom(document,{
            contentType: "text/xml"
        });
                          
        vm.runInNewContext(script, dom.window);

        let output = dom.serialize();
        return this._normalizeXml(output)
            .then((prettyXml)=>{
                return prettyXml;
            });
    }
    /*****************************************************************/
    /* END PRIVATE METHODS
    /*****************************************************************/
}
module.exports=DomMutator;