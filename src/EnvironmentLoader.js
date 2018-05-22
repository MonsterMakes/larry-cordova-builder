"use strict";
const _ = require("lodash");

class EnvLoader{
    static getCredentials(release=false){
        let buildCreds = EnvLoader.getBuildCredentials();
        let releaseCreds = EnvLoader.getReleaseCredentials();
        let defaultCreds = EnvLoader.getDefaultCredentials();
        return _.merge(defaultCreds,buildCreds,releaseCreds);
    }
    static getDefaultCredentials(){
        let defaultCreds = { 
            android: {
                keystore: null,
                alias: null,
                keyPass: null,
                keystorePass: null
            }, 
            ios: {
                teamId: null, 
                teamName: null, 
                email: null, 
                fastlaneMatchGitUrl: null,
                signingIdentity: null,
                appStoreProvisioningProfile: null,
                developmentProvisioningProfile: null
            } 
        };
        return defaultCreds;
    }
    static getReleaseCredentials(){
        let keystore = process.env.ANDROID_KEYSTORE;
        let alias = process.env.ANDROID_KEYSTORE_ALIAS;
        let keyPass = process.env.ANDROID_KEY_PASS;
        let keystorePass = process.env.ANDROID_KEYSTORE_PASS;
        let signingIdentity = process.env.IOS_SIGNING_IDENTITY;
        let appStoreProvisioningProfile = process.env.IOS_APPSTORE_PROVISIONING_PROFILE;

        return {
            android: {
                keystore,
                alias,
                keyPass,
                keystorePass
            },
            ios: {
                signingIdentity,
                appStoreProvisioningProfile
            }
        };
    }
    static getBuildCredentials(){
        let teamId = process.env.IOS_TEAM_ID;
        let email = process.env.IOS_EMAIL;
        let teamName = process.env.IOS_TEAM_NAME;
        let fastlaneMatchGitUrl = process.env.FASTLANE_MATCH_GIT_URL;
        let developmentProvisioningProfile = process.env.IOS_DEVELOPMENT_PROVISIONING_PROFILE;

        return {
            ios: {
                teamId,
                teamName,
                email,
                fastlaneMatchGitUrl,
                developmentProvisioningProfile
            }
        };
    }
}
module.exports = EnvLoader;