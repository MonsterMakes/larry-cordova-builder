"use strict";
const { exec } = require('child_process');
const fileUtils = require("./FileUtils");

class CmdUtils{
    constructor(cwd=process.cwd()){
        this._cwd = cwd;
    }
    executeCmd(cmd,cwd=this._cwd){
        return Promise.resolve()
            .then(()=>{
                return fileUtils.ensureDirectory(cwd);
            })
            .then(()=>{
                return new Promise((resolve,reject)=>{
                    console.log(`Executing cmd(${cmd}) in dir(${cwd})...`);
                    //maxBuffer = 1MB
                    exec(cmd, {cwd: cwd, maxBuffer: 1000000}, (error, stdout, stderr) => {
                        if (error) {
                            error.stdout = stdout;
                            error.stderr = stderr;
                            reject(error);
                        }
                        else{
                            resolve({stdout,stderr});
                        }
                    });
                });
            });
    }
}
module.exports=CmdUtils;