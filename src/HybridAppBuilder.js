"use strict";
const _ = require("lodash");
const underscoreString = require("underscore.string");
_.mixin(underscoreString.exports());
const EnvironmentVariablesLoader = require("./EnvironmentLoader");
const fileUtils = require("./FileUtils");
const CmdUtils = require("./CmdUtils");
const CordovaCmdUtils = require("./CordovaCmdUtils");
const FastlaneCmdUtils = require("./FastlaneCmdUtils");
const pathUtils = require("path");
const BASE_XML = require("./BaseXmlConfig");
const DomMutator = require("./mutations/DomMutator");

class HybridAppBuilder{
    constructor(configIn={}){
        this._cwd = pathUtils.resolve(_.get(configIn,"cwd",process.cwd()));
        
        this._cmdUtils = new CmdUtils(this._cwd);
        this._cordovaCmdUtils = new CordovaCmdUtils(this._cwd);
        this._fastlaneCmdUtils = new FastlaneCmdUtils(this._cwd);

        let packageJsonConfig = this._getPackageJsonConfigurations(configIn);
        //configIn takes precedence over package.json
        let cfg = _.merge({},packageJsonConfig,configIn);
        
        this._webPackageName = cfg.webPackageName;
        this._webPackageLocation = cfg.webPackageLocation;

        this._appBundleId = cfg.appBundleId;

        this._appName = _.get(cfg,'appName',cfg.name);
        this._appVersion = _.get(cfg,'appVersion',cfg.version);
        this._appDescription = _.get(cfg,'appDescription',cfg.description);
        
        this._mutations = _.get(cfg,"mutations",{});

        //credentials
        let credentialsFromEnv = EnvironmentVariablesLoader.getCredentials();
        let credentials = _.get(cfg,'credentials',{});
        this._credentials = _.merge(credentialsFromEnv,credentials);

        this._validateConfiguration();
    }
    /*********************************************************/
    /* START PRIVATE API METHODS */
    /*********************************************************/
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
            throw new Error("You must supply values for these properties in the HybridAppBuilder constructor config argument: "+errors);
        }
    }
    _retrieveConfigXmlContents(){
        let configXmlPath = pathUtils.join(this._cwd,'config.xml');
        return fileUtils.isFile(configXmlPath)
            .then(()=>{
                return fileUtils.readFileContents(configXmlPath)
            })
            .then((configXmlContents)=>{
                return configXmlContents;
            })
    }
    _generateConfigXml(mutation){
        let scripts = _.get(mutation,'scripts',[]);
        
        //Push the seeded mutation... This sets the config.xml basics name version etc...
        scripts.push((dom,config)=>{
            let document = dom.window.document;
            let widget = document.querySelector('widget');
            widget.setAttribute('version', this._appVersion);
            widget.setAttribute('id', this._appBundleId);

            let descriptionElem = document.createElement('description');
            descriptionElem.textContent = this._appDescription;
            
            let nameElem = document.createElement('name');
            nameElem.textContent = this._appName;
            
            widget.insertBefore(descriptionElem,widget.firstElementChild);
            widget.insertBefore(nameElem,widget.firstElementChild);
        });
        let xmlWriter = new DomMutator(_.get(mutation,'baseXml',BASE_XML),scripts);

        return xmlWriter.build()
            .then(xml=>{
                return fileUtils.writeContentsToFile(pathUtils.join(this._cwd,'config.xml'), xml, 0o644 & ~process.umask());
            });
    }
    _generateFastlaneAssets(){
        let templateData = {
            appBundleId: this._appBundleId,
            webPackageName: this._webPackageName,
            appName: this._appName,
            appVersion: this._appVersion,
            appDescription: this._appDescription,
            credentials: this._credentials
        };
        let assetsToMove = [
            "fastlane/Fastfile",
            "fastlane/Appfile",
            {
                src: "fastlane/Gemfile",
                dest: "Gemfile"
            },
            "fastlane/Matchfile",
            "fastlane/Pluginfile"
        ];
        let proms = [];
        assetsToMove.forEach((asset)=>{
            let srcPath = asset;
            let destPath = asset;
            if(_.isPlainObject(asset)){
                srcPath = asset.src;
                destPath = asset.dest;
            }
            let src = pathUtils.join(__dirname,"..","resources",srcPath);
            let dest = pathUtils.join(this._cwd,destPath);
            let prom = fileUtils.writeTemplate(src,templateData,dest);
            proms.push(prom);
        });
        return Promise.all(proms);
    }
    _validateTargetPlatform(targetPlatform){
        switch(targetPlatform){
            case 'all':
            case 'ios':
            case 'android':
                //do nothing this is good
            break;
            default:
                return Promise.reject(new Error('HybridAppBuilder.build()\'s targetPlatform must be either "ios" or "android" or "all".'));
            break;
        }
    }
    /*********************************************************/
    /* END PRIVATE API METHODS */
    /* START PUBLIC API METHODS */
    /*********************************************************/
    /**
     * Will make sure your project is properly setup to run the build.
     */
    setupBuild(skipPrepare=false){
        let wwwDir = pathUtils.join(this._cwd,'www');
        let platformsDir = pathUtils.join(this._cwd,'platforms');
        let pluginsDir = pathUtils.join(this._cwd,'plugins');
        let packageJsonFile = pathUtils.join(this._cwd,'package.json');
        let configXmlOriginalContents = undefined;

        return fileUtils.isDirectory(wwwDir)
            //symlink www
            .catch(()=>{
                //If its not a symbolic link already
                return fileUtils.isSymbolicLink(wwwDir)
                    .catch(()=>{
                        let packageLocation = `node_modules/${this._webPackageName}/dist`;
                        if(this._webPackageLocation){
                            packageLocation = this._webPackageLocation;
                        }
                        console.info("");
                        console.info(`*** Symoblically linking www directory to ${packageLocation}...`);
                        
                        let cmd = `ln -s ${packageLocation} www`;
                        return this._cmdUtils.executeCmd(cmd,this._cwd);
                    });
            })
            //create package.json if one does not exist
            .then(()=>{
                return Promise.resolve()
                    .then(()=>{
                        return fileUtils.isFile(packageJsonFile)
                    })
                    .catch(()=>{
                        console.info("");
                        console.info(`*** No package.json found, generating one...`);
                        
                        let cordovaVersion = "*";
                        let larryHybridBuilderPkgLocation = pathUtils.join(__dirname,'..','package.json');
                        try{
                            let pkg = require(larryHybridBuilderPkgLocation);
                            cordovaVersion = pkg.dependencies.cordova;
                        }
                        catch(e){
                            console.warn("For some reason we could NOT find a default cordova version, generating app package.json using latest cordova.");
                        }
                        let name = _.dasherize(_.decapitalize(_.humanize(this._appName)));
                        if(name.startsWith('@')){
                            name = name.slice(1);
                        }
                        let packageContents = {
                            name: name,
                            version: this._appVersion,
                            description: this._appDescription,
                            private: true,
                            dependencies: {
                                cordova: cordovaVersion
                            }
                        };
                        return fileUtils.writeContentsToFile(packageJsonFile, JSON.stringify(packageContents,null,'\t'), 0o644 & ~process.umask());
                    });
            })
            //capture the current contents of config.xml
            .then(()=>{
                return this._retrieveConfigXmlContents()
                    .then(
                        (contents)=>{
                            return configXmlOriginalContents = contents;
                        },
                        ()=>{
                            //not found this is ok
                            configXmlOriginalContents = undefined;
                        }
                    )
            })
            //Initial Mutations
            .then(()=>{
                console.info("");
                console.info(`*** Executing mutations...`);

                let proms = [];
                if(_.isArray(this._mutations.prePrepare)){
                    this._mutations.prePrepare.forEach((mutation)=>{
                        //CordovaConfigXml Mutation
                        if(_.isPlainObject(mutation) && mutation.type === 'CordovaConfigXml'){
                            proms.push(this._generateConfigXml(mutation));
                        }
                        else{
                            console.warn("An Unknown Initial Mutation was found, skipping...", mutation);
                        }
                    });
                }
                else{
                    console.info("No Initial Mutations found, running the default mutations...");
                    proms.push(this._generateConfigXml());
                }
                return Promise.all(proms);
            })
            //prepare
            .then(()=>{   
                if(!skipPrepare){
                    return this._retrieveConfigXmlContents()
                        .then((contents)=>{
                            if(configXmlOriginalContents !== contents){
                                console.info("");
                                console.info("*** Detected Changes in config.xml runnning cordova prepare...");
                                
                                return this._cordovaCmdUtils.prepareCordovaProject();
                            }
                            else{
                                console.info("No Changes found in config.xml skipping cordova prepare...");
                            }
                        }); 
                }
            })
            //setup fastlane assets
            .then(()=>{
                console.info("");
                console.info("*** Installing fastlane assets...");
                
                return Promise.resolve()
                    .then(()=>{
                        return fileUtils.ensureDirectory(pathUtils.join(this._cwd,'_RELEASE_'));
                    })
                    .then(()=>{
                        return this._generateFastlaneAssets();
                    })
                    //install all the ruby things
                    .then(()=>{
                        return this._cmdUtils.spawnCmd("bundle", ["install"]);
                    });
            });
    }
    build(targetPlatform='all'){
        this._validateTargetPlatform(targetPlatform);
        return this._fastlaneCmdUtils.executeFastlaneCmd(null,'build',{
            targetPlatform: targetPlatform,
            developmentProvisioningProfile: this._credentials.ios.developmentProvisioningProfile,
        });
    }
    launch(targetPlatform='all'){
        this._validateTargetPlatform(targetPlatform);
        return this._fastlaneCmdUtils.executeFastlaneCmd(null,'launch',{targetPlatform});
    }
    release(targetPlatform='all'){
        this._validateTargetPlatform(targetPlatform);
        return this._fastlaneCmdUtils.executeFastlaneCmd(null,'release',{
            targetPlatform: targetPlatform,
            appStoreProvisioningProfile: this._credentials.ios.appStoreProvisioningProfile
        });
    }
    submit(targetPlatform='all'){
        this._validateTargetPlatform(targetPlatform);
        return this._fastlaneCmdUtils.executeFastlaneCmd(null,'submit',{targetPlatform});
    }
    /*********************************************************/
    /* END PUBLIC API METHODS */
    /*********************************************************/
}
module.exports=HybridAppBuilder;