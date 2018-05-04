"use strict";
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const chaiFiles = require('chai-files');
chai.use(chaiFiles);
const file = chaiFiles.file;
const dir = chaiFiles.dir;

const pathUtils = require("path");

const fs = require("fs-extra");
const TEST_DIR_PREFIX = `${__dirname}/working_dir/`;

const testUtils = new (require('../TestUtils'))(__dirname);

const HybridAppBuilder = require("../../src/HybridAppBuilder");
const _setupEmptyCordovaDir = (path)=>{
    fs.copySync(pathUtils.join(__dirname,'..','mocks','node_modules'),pathUtils.join(path,'node_modules'));

    fs.copySync(pathUtils.join(__dirname,'..','mocks','res'),pathUtils.join(path,'res'));
}

const TEST_NAME = "HybridAppBuilder.build()";
describe(TEST_NAME, () => {
    before(()=>{
        testUtils.cleanUpWorkingDirs();
    })
    it("should build a simple android app", () => {
        let testDir = testUtils.getUniqueTestDirPath();
        fs.mkdirsSync(testDir);
        _setupEmptyCordovaDir(testDir);
        let devCreds = testUtils.getDeveloperCreds();
        
        let hybridAppBuilder = new HybridAppBuilder({
            cwd: testDir,
            appName: "wonky-mobile-web",
            appVersion: "0.0.0",
            appDescription: "Some Description",
            webPackageName: "wonky-mobile-web",
            appBundleId: "com.wonky.mobile",
            developerCreds: devCreds
        });
        return hybridAppBuilder.setupBuild()
            .then(()=>{
                return hybridAppBuilder.build('android');
            })
            .then(()=>{
                let apk = file(testDir+"platforms/android/app/build/outputs/apk/debug/app-debug.apk");
                expect(apk).to.exist;
            })
            .catch(e=>{
                console.log("error",e);
                return Promise.reject(e);
            });
    });
    it("should build a simple ios app", () => {
        let testDir = testUtils.getUniqueTestDirPath();
        fs.mkdirsSync(testDir);
        _setupEmptyCordovaDir(testDir);
        let devCreds = testUtils.getDeveloperCreds();

        let hybridAppBuilder = new HybridAppBuilder({
            cwd: testDir,
            appName: "wonky-mobile-web",
            appVersion: "0.0.0",
            appDescription: "Some Description",
            webPackageName: "wonky-mobile-web",
            appBundleId: "com.wonky.mobile",
            developerCreds: devCreds
        });
        return hybridAppBuilder.setupBuild()
            .then(()=>{
                return hybridAppBuilder.build('ios');
            })
            .then(()=>{
                let ipa = file(testDir+"platforms/ios/build/device/wonky-mobile-web.ipa");
                expect(ipa).to.exist;
            })
            .catch(e=>{
                if(e.code){
                    console.error(`${e.stdout}`);
                    console.error(`Command (${e.cmd}) exited with code ${e.code}`);
                }
                return Promise.reject(e);
            });
    });
    it("should build artifacts for both platforms", () => {
        //1.5 minutes
        this.timeout(90000);
        let testDir = testUtils.getUniqueTestDirPath();
        fs.mkdirsSync(testDir);
        _setupEmptyCordovaDir(testDir);
        let devCreds = testUtils.getDeveloperCreds();

        let hybridAppBuilder = new HybridAppBuilder({
            cwd: testDir,
            appName: "wonky-mobile-web",
            appVersion: "0.0.0",
            appDescription: "Some Description",
            webPackageName: "wonky-mobile-web",
            appBundleId: "com.wonky.mobile",
            developerCreds: devCreds
        });
        return hybridAppBuilder.setupBuild()
            .then(()=>{
                return hybridAppBuilder.build('all');
            })
            .then(()=>{
                let ipa = file(testDir+"platforms/ios/build/device/wonky-mobile-web.ipa");
                expect(ipa).to.exist;
                let apk = file(testDir+"platforms/android/app/build/outputs/apk/debug/app-debug.apk");
                expect(apk).to.exist;
            })
            .catch(e=>{
                if(e.code){
                    console.error(`${e.stdout}`);
                    console.error(`Command (${e.cmd}) exited with code ${e.code}`);
                }
                return Promise.reject(e);
            });
    });
});