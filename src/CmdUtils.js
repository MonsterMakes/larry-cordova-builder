"use strict";
const { exec } = require('child_process');
const { spawn } = require('child_process');
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
    spawnCmd(cmd,args,cwd=this._cwd){
        console.log(`Spawning cmd(${cmd}) in dir(${cwd})...`);
        return new Promise((resolve,reject)=>{
            //auto pipe std in/out/err to process
            let satanSpawn = spawn(cmd,args, {stdio:'inherit',cwd: this._cwd});
            
            satanSpawn.on('exit', function (code) {
                if(code){
                    let err = new Error(`Command Failed -> ${cmd} ${args.join(" ")}`);
                    err.exitCode = code;
                    reject(err);
                }
                else{
                    resolve();
                }
            });
        });
    }
}
module.exports=CmdUtils;