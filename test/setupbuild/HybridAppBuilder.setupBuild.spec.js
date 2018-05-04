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
    
    fs.writeFileSync(pathUtils.join(path,"package.json"),JSON.stringify(require('./mocks/package.json'),null,'\t'));
}

const TEST_NAME = "Test HybridAppBuilder's setup()";
describe(TEST_NAME, () => {
    before(()=>{
        testUtils.cleanUpWorkingDirs();
    })
	it("should setup required directories for cordova and a default config.xml", () => {
        let testDir = testUtils.getUniqueTestDirPath();
        fs.mkdirsSync(testDir);
        _setupEmptyCordovaDir(testDir);
        let devCreds = testUtils.getDeveloperCreds();
        
        let hybridAppBuilder = new HybridAppBuilder({
            cwd: testDir,
            webPackageName: "wonky-mobile-web",
            appBundleId: "wonky.mobile.app",
            appName: "wonky-mobile-web",
            appVersion: "1.0.1",
            appDescription: "This is the wonky app",
            developerCreds: devCreds
        });
        return hybridAppBuilder.setupBuild()
            .then(()=>{
                let stats = fs.lstatSync(pathUtils.join(testDir,"www"));
                expect(stats.isSymbolicLink()).to.be.true;

                let platformsDir = dir(testDir+"platforms");
                expect(platformsDir).to.exist;

                let configXml = file(testDir+"config.xml");
                expect(configXml).to.exist;
            });
    });
    it("should setup required directories for cordova and a default config.xml using package.json", () => {
        let testDir = testUtils.getUniqueTestDirPath();
        fs.mkdirsSync(testDir);
        _setupEmptyCordovaDir(testDir);
        let devCreds = testUtils.getDeveloperCreds();
        
        let hybridAppBuilder = new HybridAppBuilder({
            cwd: testDir,
            webPackageName: "wonky-mobile-web",
            appBundleId: "com.wonky.mobile",
            developerCreds: devCreds
        });
        return hybridAppBuilder.setupBuild()
            .then(()=>{
                let stats = fs.lstatSync(pathUtils.join(testDir,"www"));
                expect(stats.isSymbolicLink()).to.be.true;

                let platformsDir = dir(testDir+"platforms");
                expect(platformsDir).to.exist;

                let configXml = file(testDir+"config.xml");
                expect(configXml).to.exist;
                expect(configXml).to.match(/cordova-plugin-device/);           
            });
    });
    
});