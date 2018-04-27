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
    
    fs.writeFileSync(pathUtils.join(path,"package.json"),JSON.stringify(require('./mocks/package.json'),null,'\t'));
}

const TEST_NAME = "Test CordovaBuild's setup()";
describe(TEST_NAME, () => {
    before(()=>{
        TestUtils.cleanUpWorkingDirs();
    })
	it("should setup required directories for cordova and a default config.xml", () => {
        let testDir = TestUtils.getUniqueTestDirPath();
        fs.mkdirsSync(testDir);
        _setupEmptyCordovaDir(testDir);
        
        let cordovaBuild = new CordovaBuild({
            cwd: testDir,
            webPackageName: "wonky-mobile-web",
            appBundleId: "wonky.mobile.app",
            appName: "Wonky Mobile",
            appVersion: "1.0.1",
            appDescription: "This is the wonky app"
        });
        return cordovaBuild.setupBuild()
            .then(()=>{
                let stats = fs.lstatSync(pathUtils.join(testDir,"www"));
                expect(stats.isSymbolicLink()).to.be.true;

                let platformsDir = dir(testDir+"platforms");
                expect(platformsDir).to.exist;

                let configXml = file(testDir+"config.xml");
                configXml.with.content(require("../../src/BaseXmlConfig"));
            });
    });
    it.only("should setup required directories for cordova and a default config.xml using package.json", () => {
        let testDir = TestUtils.getUniqueTestDirPath();
        fs.mkdirsSync(testDir);
        _setupEmptyCordovaDir(testDir);
        
        let cordovaBuild = new CordovaBuild({
            cwd: testDir,
            webPackageName: "wonky-mobile-web",
            appBundleId: "com.wonky.mobile"
        });
        return cordovaBuild.setupBuild()
            .then(()=>{
                let stats = fs.lstatSync(pathUtils.join(testDir,"www"));
                expect(stats.isSymbolicLink()).to.be.true;

                let platformsDir = dir(testDir+"platforms");
                expect(platformsDir).to.exist;

                let configXml = file(testDir+"config.xml");
                configXml.with.content(require("../../src/BaseXmlConfig"));
            });
    });
    
});