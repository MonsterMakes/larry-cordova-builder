"use strict";
const fs = require("fs-extra");
const EnvLoader = require("../src/EnvironmentLoader");

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
    getReleaseCreds(){
        let creds = EnvLoader.getReleaseCredentials();
        if(!creds.android.keystore){
            throw new Error("YOU MUST SUPPLY A ANDROID_KEYSTORE environment variable, this is the Path to the java keystore file.")
        }
        if(!creds.android.alias){
            throw new Error("YOU MUST SUPPLY A ANDROID_KEYSTORE_ALIAS environment variable, this is the alias of the certificate in the java keystore file.")
        }
        if(!creds.android.keyPass){
            throw new Error("YOU MUST SUPPLY A ANDROID_KEY_PASS environment variable, this is the password used to protect the private key of the java keystore file.")
        }
        if(!creds.android.keystorePass){
            throw new Error("YOU MUST SUPPLY A ANDROID_KEYSTORE_PASS environment variable, this is the password of the java keystore file.")
        }
        return creds;
    }
    getBuildCredentials(){
        let creds = EnvLoader.getBuildCredentials();
        if(!creds.ios.teamId){
            throw new Error("YOU MUST SUPPLY A IOS_TEAM_ID environment variable, this is the 10 digit apple developer id.")
        }
        if(!creds.ios.email){
            throw new Error("YOU MUST SUPPLY A IOS_EMAIL environment variable, this is your apple email.")
        }
        if(!creds.ios.teamName){
            throw new Error("YOU MUST SUPPLY A IOS_TEAM_NAME environment variable, this is your apple developer team name.")
        }
        if(!creds.ios.fastlaneMatchGitUrl){
            throw new Error("YOU MUST SUPPLY A FASTLANE_MATCH_GIT_URL environment variable, this is the url to your match git repo (https://docs.fastlane.tools/actions/match/).")
        }
    }
};
module.exports=TestUtils;