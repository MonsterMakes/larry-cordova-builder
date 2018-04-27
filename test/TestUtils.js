"use strict";
const fs = require("fs-extra");

class TestUtils {
    static cleanUpWorkingDirs(testName) {
        //Clean up any previous tests
        fs.removeSync(TestUtils.getWorkingDir());
        fs.mkdirsSync(TestUtils.getWorkingDir());
    }
    static getUniqueTestDirPath () {
        return TestUtils.getWorkingDir() + new Date().getTime() +"/";
    }
    static getWorkingDir(){
        return `${__dirname}/WORKING_DIRECTORY/`;
    }
};
module.exports=TestUtils;