'use strict';
const PromiseUtils = require("./PromiseUtils");
const _ = require("lodash");

class Mutator{
    constructor(baseDocument='', mutations=[]){
        this._mutations = mutations;
        this._baseDocument = baseDocument;
        this._document = undefined;
    }
    /*****************************************************************/
    /* START BASE METHODS */
    /*****************************************************************/
    _initializeBaseDocument(doc){
        this._document = doc;
        return Promise.resolve(this._document);
    }
    _executeMutation(document,mutation){
        return Promise.resolve()
            .then(()=>{
                //custom sauce mutation
                if(_.isFunction(mutation)){
                    return mutation.call(this,document,mutation);
                }
                //Unknown mutation type
                else{
                    //need logging
                    let errMsg = `An unsupported mutation was found.`;
                    console.error(errMsg,mutation);
                    return Promise.reject(errMsg);
                }
            });
    }
    _finalizeDocument(){
        return Promise.resolve(this._document);
    }
    /*****************************************************************/
    /* END BASE METHODS */
    /* START PUBLIC METHODS */
    /*****************************************************************/
    build(){
        return Promise.resolve()
            .then(()=>{
                if(this._document === undefined){
                    return this._initializeBaseDocument(this._baseDocument);
                }
            })
            .then((baseDoc)=>{
                return PromiseUtils.serial(this._mutations,(allProm,mutation,currentIndex)=>{            
                    return allProm.then(()=>{
                        let prom = Promise.resolve();
                        return prom.then(()=>{
                            this._executeMutation(this._document,mutation);
                        });
                    });
                });
            })
            .then(()=>{
                return this._finalizeDocument();
            });
    }
    /*****************************************************************/
    /* END PUBLIC METHODS */
    /*****************************************************************/
}
module.exports=Mutator;