"use strict";
const _ = require("lodash");
const underscoreString = require("underscore.string");
_.mixin(underscoreString.exports());
const fs = require("fs-extra");
const pathUtils = require("path");
const { exec } = require('child_process');
const cordovaCli = require('cordova').cli;
const XmlMutator = require("./XmlMutator");

class CordovaBuild{
    constructor(configIn={}){
        this._cwd = pathUtils.resolve(_.get(configIn,"cwd",process.cwd()));
        
        let packageJsonConfig = this._getPackageJsonConfigurations(configIn);
        //configIn takes precedence over package.json
        let cfg = _.merge({},packageJsonConfig,configIn);
        
        this._webPackageName = cfg.webPackageName;
        this._webPackageLocation = cfg.webPackageLocation;

        this._appBundleId = cfg.appBundleId;

        this._appName = _.get(cfg,'appName',_.titleize(_.humanize(cfg.name)));
        this._appVersion = _.get(cfg,'appVersion',cfg.version);
        this._appDescription = _.get(cfg,'appDescription',cfg.description);
        
        this._mutations = _.get(cfg,"mutations",[]);
        
        //Xml Mutation settings for the config.xml file
        this._configXmlGeneration = _.merge({},
            {
                baseXml: require("./BaseXmlConfig"),
                mutations: []
            },
            cfg.configXmlGeneration
        );

        let seededMutations = [
            //set the applicationName
            (xmlObj,config)=>{
                xmlObj.widget.name = this._appName;
                xmlObj.widget.description = this._appDescription;
                xmlObj.widget.$.version = this._appVersion;
                xmlObj.widget.$.id = this._appBundleId;
            }
        ];
        this._configXmlGeneration.mutations = seededMutations.concat(this._configXmlGeneration.mutations);

        this._validateConfiguration();
    }
    _getPackageJsonConfigurations(config){
        let cfg = {};
        let packageJsonConfigProp = _.get(config,"usePackageJsonConfigName","larry-hybrid-app");
        this._packageJsonLocation = _.get(config,"usePackageJsonCustomLocation",pathUtils.join(this._cwd,'package.json'));

        //pull the defaults from package.json
        try{
            let pkg = require(this._packageJsonLocation);
            let nestedConfig = pkg[packageJsonConfigProp];
            cfg = _.merge(cfg,{
                name: pkg.name,
                version: pkg.version,
                description: pkg.description
            },nestedConfig);
            return cfg;
        }
        catch(e){
            console.info("No package.json defined skipping loading config from this location: "+this._packageJsonLocation);
            return {};
        }
    }
    _validateConfiguration(){
        let errors = [];
        let validateMembers = (propNames) =>{
            propNames.forEach(propName => {
                if(!this['_'+propName]){
                    if(propName === 'webPackageName'){
                        //make sure webPackageLocation is not being used instead
                        if(!this._webPackageLocation){
                            errors.push("webPackageName or webPackageLocation");
                        }
                    }
                    else{
                        errors.push(propName);
                    }
                } 
            });
        };
        validateMembers(['webPackageName','appBundleId','appName','appVersion','appDescription']);
        if(!_.isEmpty(errors)){
            throw new Error("You must supply values for these properties in the CordovaBuild constructor config argument: "+errors);
        }
    }
    _deleteDirectory(path){
        return new Promise((resolve,reject)=>{
            fs.rmdir(path,(err)=>{
                if (error) {
                    reject(error);
                }
                else{
                    resolve();
                }
            });
        });
    }
    _executeCmd(cmd,cwd=this._cwd){
        return Promise.resolve()
            .then(()=>{
                return this._ensureDirectory(cwd);
            })
            .then(()=>{
                new Promise((resolve,reject)=>{
                    exec(cmd, {cwd: cwd}, (error, stdout, stderr) => {
                        if (error) {
                            reject(error);
                        }
                        else{
                            resolve({stdout,stderr});
                        }
                    });
                });
            });
    }
    _ensureDirectory(path){
        return new Promise((resolve,reject)=>{
            fs.ensureDir(path,(err)=>{
                if(err){
                    reject(err);
                }
                else{
                    resolve();
                }
            });
        });
    }
    _isDirectory(path){
        return this._testPath(path)
            .then((result)=>{
                if(result && result.type === 'directory'){
                    return Promise.resolve(true);
                }
                else{
                    return Promise.reject(new Error(path+" is not a directory."));
                }
            });
    }
    _isFile(path){
        return this._testPath(path)
            .then((result)=>{
                if(result && result.type === 'file'){
                    return Promise.resolve(true);
                }
                else{
                    return Promise.reject(new Error(path+" is not a file."));
                }
            });
    }
    _isSymbolicLink(path){
        return this._testPath(path)
            .then((result)=>{
                if(result && result.type === 'link'){
                    return Promise.resolve(true);
                }
                else{
                    return Promise.reject(new Error(path+" is not a link."));
                }
            });
    }
    _testPath(path){
        return new Promise((resolve,reject)=>{
            fs.lstat(path,(err, stats)=>{
                if(err){
                    //err.code === "ENOENT" //no such file or directory
                    reject(err);
                }
                else{
                    if(stats.isSymbolicLink()){
                        resolve({
                            path: path,
                            type: 'link'
                        });
                    }
                    else if(stats.isDirectory()){
                        resolve({
                            path: path,
                            type: 'directory'
                        });
                    }
                    else if(stats.isFile()){
                        resolve({
                            path: path,
                            type: 'file'
                        });
                    }
                    else{
                        reject(new Error(path+" is not a directory, file, or symbolic link."));
                    }
                }
            });
        });
    }
    _runCordovaCliCmd(cmdArr){
        const _realCwd = process.cwd();
        const _realPwd = process.env.PWD;
        return Promise.resolve()
            .then(()=>{
                return this._ensureDirectory(this._cwd);
            })
            .then(()=>{
                return new Promise((resolve,reject)=>{
                    try{
                        process.chdir(this._cwd);
                        process.env.PWD = this._cwd;
                        cordovaCli(cmdArr,(err)=>{
                            //reset process path info
                            process.chdir(_realCwd);
                            process.env.PWD = _realPwd;
                            if(err){
                                reject(err);
                            }
                            else{
                                resolve();
                            }
                        });
                    }
                    catch(e){
                        //reset process path info even on failure
                        process.chdir(_realCwd);
                        process.env.PWD = _realPwd;
                    }
                });
            });
    }
    _cordovaCliBuild(releaseMode='--release',targetPlatform){
        const RELEASE_MODE = releaseMode;
        const _realCwd = process.cwd();

        let cmdArgs = ['node','cordova','build'];
        if(targetPlatform){
            cmdArgs.push(targetPlatform);
        }
        cmdArgs.push(RELEASE_MODE);
        return this._runCordovaCliCmd(cmdArgs);
    }
    _cordovaCliPrepare(){
        return this._runCordovaCliCmd(['node','cordova','prepare']);
    }
    _generateConfigXml(){
        let xmlWriter = new XmlMutator(this._configXmlGeneration.baseXml,this._configXmlGeneration.mutations);
        
        return xmlWriter.build()
            .then(xml=>{
                return new Promise((resolve,reject)=>{
                    fs.writeFile(pathUtils.join(this._cwd,'config.xml'), xml, {encoding: 'utf8', mode: 0o644 & ~process.umask()}, (err) => {
                        if (err) {
                            reject(err);
                        }
                        else{
                            resolve(xml);
                        }
                    });
                });
            });
    }
    /**
     * Will make sure your project is properly setup to run the build.
     */
    setupBuild(){
        let wwwDir = pathUtils.join(this._cwd,'www');
        let platformsDir = pathUtils.join(this._cwd,'platforms');
        let pluginsDir = pathUtils.join(this._cwd,'plugins');
        let packageJsonFile = pathUtils.join(this._cwd,'package.json');

        return this._isDirectory(wwwDir)
            //symlink www
            .catch(()=>{
                //If its not a symbolic link already
                return this._isSymbolicLink(wwwDir)
                    .catch(()=>{
                        let packageLocation = `node_modules/${this._webPackageName}/dist`;
                        if(this._webPackageLocation){
                            packageLocation = this._webPackageLocation;
                        }
                        let cmd = `ln -s ${packageLocation} www`;
                        return this._executeCmd(cmd,this._cwd);
                    });
            })
            //generate xml
            .then(()=>{
                return this._isFile(pathUtils.join(this._cwd,'config.xml'))
                    //if there is no config.xml generate one
                    .catch(()=>{
                        return this._generateConfigXml();
                    });
            })
            //create package.json if one does not exist
            .then(()=>{
                return Promise.resolve()
                    .then(()=>{
                        return this._isFile(packageJsonFile)
                    })
                    .catch(()=>{
                        return new Promise((resolve,reject)=>{
                            let cordovaVersion = "*";
                            let larryHybridBuilderPkgLocation = pathUtils.join(__dirname,'..','package.json');
                            try{
                                let pkg = require(larryHybridBuilderPkgLocation);
                                cordovaVersion = pkg.dependencies.cordova;
                            }
                            catch(e){
                                console.warn("For some reason we could NOT find a default cordova version, generating app package.json using latest cordova.");
                            }
                            let packageContents = {
                                name: _.dasherize(this._appName).slice(1),
                                version: this._appVersion,
                                description: this._appDescription,
                                private: true,
                                dependencies: {
                                    cordova: cordovaVersion
                                }
                            };
                            fs.writeFile(packageJsonFile, JSON.stringify(packageContents,null,'\t'), {encoding: 'utf8', mode: 0o644 & ~process.umask()}, (err) => {
                                if (err) {
                                    reject(err);
                                }
                                else{
                                    resolve();
                                }
                            });
                        });
                    });
            })
            //prepare
            .then(()=>{    
                return this._isDirectory(platformsDir)
                    //plugins are optional therefore you may not have a plugins directory
                    // .then(()=>{    
                    //     return this._isDirectory(pluginsDir)
                    // })
                    //platforms or plugins does not exist symlink it
                    .catch(()=>{
                        return this._cordovaCliPrepare();
                    })
            })
            .then((results)=>{
                console.log(results);
            });
    }
    build(releaseMode='release',targetPlatform){
        if(releaseMode){
            releaseMode = '--'+releaseMode;
        }
        return this._cordovaCliBuild(releaseMode,targetPlatform);
    }
    release(releaseMode='release',targetPlatform){
        //do the build and then release the thing(s)
    }
}
module.exports=CordovaBuild;