"use strict";
const fs = require("fs-extra");

class TestUtils {
    constructor(cwd){
        this._cwd = cwd || process.cwd();
    }
    cleanUpWorkingDirs(testName) {
        //Clean up any previous tests
        fs.removeSync(this.getWorkingDir());
        fs.mkdirsSync(this.getWorkingDir());
    }
    getUniqueTestDirPath () {
        return this.getWorkingDir(this._cwd) + new Date().getTime() +"/";
    }
    getWorkingDir(){
        return `${this._cwd}/WORKING_DIRECTORY/`;
    }
    getDeveloperCreds(){
        let iosTeamId = process.env.IOS_TEAM_ID;
        if(!iosTeamId){
            throw new Error("YOU MUST SUPPLY A IOS_TEAM_ID environment variable, this is the 10 digit apple developer id.")
        }
        let appleEmail = process.env.IOS_EMAIL;
        if(!appleEmail){
            throw new Error("YOU MUST SUPPLY A IOS_EMAIL environment variable, this is your apple email.")
        }
        let iosTeamName = process.env.IOS_TEAM_NAME;
        if(!iosTeamName){
            throw new Error("YOU MUST SUPPLY A IOS_TEAM_NAME environment variable, this is your apple developer team name.")
        }
        let fastlaneMatchGitUrl = process.env.FASTLANE_MATCH_GIT_URL;
        if(!fastlaneMatchGitUrl){
            throw new Error("YOU MUST SUPPLY A FASTLANE_MATCH_GIT_URL environment variable, this is the url to your match git repo (https://docs.fastlane.tools/actions/match/).")
        }
        return {
            ios: {
                teamId: iosTeamId,
                iosTeamName: iosTeamName,
                iosEmail: appleEmail,
                fastlaneMatchGitUrl: fastlaneMatchGitUrl
            }
        };
    }
};
module.exports=TestUtils;