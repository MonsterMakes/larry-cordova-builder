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

const TestUtils = require('../TestUtils');

const CordovaBuild = require("../../src/CordovaBuild");
const _setupEmptyCordovaDir = (path)=>{
    fs.mkdirsSync(pathUtils.join(path,'node_modules','wonky-mobile-web','dist'));

    fs.copySync(pathUtils.join(__dirname,'mocks','res'),pathUtils.join(path,'res'));
}

const TEST_NAME = "Test CordovaBuild's build()";
describe(TEST_NAME, () => {
    before(()=>{
        TestUtils.cleanUpWorkingDirs();
    })
    it.only("should build a simple app", () => {
        let testDir = TestUtils.getUniqueTestDirPath();
        fs.mkdirsSync(testDir);
        _setupEmptyCordovaDir(testDir);
        
        let cordovaBuild = new CordovaBuild({
            cwd: testDir,
            appName: "wonky-mobile-web",
            appVersion: "0.0.0",
            appDescription: "Some Description",
            webPackageName: "wonky-mobile-web",
            appBundleId: "com.wonky.mobile"
        });
        return cordovaBuild.setupBuild()
            .then(()=>{
                return cordovaBuild.build('debug','android');
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
    
});