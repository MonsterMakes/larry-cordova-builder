"use strict";
const CmdUtils = require("./CmdUtils");

class FastlaneCmdUtils extends CmdUtils{
    constructor(cwd=process.cwd()){
        super(cwd);
    }
    executeFastlaneCmd(platform,lane,args){
        let cmd = lane;
        if(platform){
            cmd = platform +' '+lane;
        }
        Object.keys(args).forEach(key=>{
            cmd = cmd + " " + key +':'+args[key];
        });
        cmd = `bundle exec fastlane ${cmd}`;
        return this.executeCmd(cmd);
    }
}
module.exports=FastlaneCmdUtils;