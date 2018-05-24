"use strict";
const CmdUtils = require("./CmdUtils");

class FastlaneCmdUtils extends CmdUtils{
    constructor(cwd=process.cwd()){
        super(cwd);
    }
    executeFastlaneCmd(platform,lane,args){
        let command = 'bundle';
        let commandArgs = ['exec','fastlane'];
        
        if(platform){
            commandArgs.push(platform);
        }
        commandArgs.push(lane);

        Object.keys(args).forEach(key=>{
            if(args[key]){
                commandArgs.push(key +':'+args[key]);
            }
        });

        return this.spawnCmd(command,commandArgs);
    }
}
module.exports=FastlaneCmdUtils;