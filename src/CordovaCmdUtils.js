"use strict";
const fileUtils = require("./FileUtils");
const cordovaCli = require('cordova').cli;
const CmdUtils = require("./CmdUtils");

class CordovaCmdUtils extends CmdUtils{
    constructor(cwd=process.cwd()){
        super(cwd);
    }
    executeCordovaCliCmd(cmdArr){
        const _realCwd = process.cwd();
        const _realPwd = process.env.PWD;
        return Promise.resolve()
            .then(()=>{
                return fileUtils.ensureDirectory(this._cwd);
            })
            .then(()=>{
                return new Promise((resolve,reject)=>{
                    try{
                        process.chdir(this._cwd);
                        process.env.PWD = this._cwd;
                        cordovaCli(cmdArr,(err)=>{
                            //reset process path info
                            process.chdir(_realCwd);
                            process.env.PWD = _realPwd;
                            if(err){
                                reject(err);
                            }
                            else{
                                resolve();
                            }
                        });
                    }
                    catch(e){
                        //reset process path info even on failure
                        process.chdir(_realCwd);
                        process.env.PWD = _realPwd;
                    }
                });
            });
    }
    prepareCordovaProject(){
        return this.executeCordovaCliCmd(['node','cordova','prepare']);
    }
}
module.exports=CordovaCmdUtils;