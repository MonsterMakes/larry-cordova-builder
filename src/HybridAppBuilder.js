"use strict";
const _ = require("lodash");
const underscoreString = require("underscore.string");
_.mixin(underscoreString.exports());
const fileUtils = require("./FileUtils");
const CmdUtils = require("./CmdUtils");
const CordovaCmdUtils = require("./CordovaCmdUtils");
const FastlaneCmdUtils = require("./FastlaneCmdUtils");
const pathUtils = require("path");

const XmlMutator = require("./XmlMutator");

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

        this._appName = _.get(cfg,'appName',_.titleize(_.humanize(cfg.name)));
        this._appVersion = _.get(cfg,'appVersion',cfg.version);
        this._appDescription = _.get(cfg,'appDescription',cfg.description);
        
        this._mutations = _.get(cfg,"mutations",[]);

        this._developerCreds = _.get(cfg,'developerCreds',{ android: {}, ios: {teamId: null, iosTeamName: null, iosEmail: null, fastlaneMatchGitUrl: null}});
        
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
    _generateConfigXml(){
        let xmlWriter = new XmlMutator(this._configXmlGeneration.baseXml,this._configXmlGeneration.mutations);
        
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
            iosTeamId: this._developerCreds.ios.teamId,
            iosEmail: this._developerCreds.ios.iosEmail,
            iosTeamName: this._developerCreds.ios.iosTeamName,
            fastlaneMatchGitUrl: this._developerCreds.ios.fastlaneMatchGitUrl
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
    setupBuild(){
        let wwwDir = pathUtils.join(this._cwd,'www');
        let platformsDir = pathUtils.join(this._cwd,'platforms');
        let pluginsDir = pathUtils.join(this._cwd,'plugins');
        let packageJsonFile = pathUtils.join(this._cwd,'package.json');

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
                        let cmd = `ln -s ${packageLocation} www`;
                        return this._cmdUtils.executeCmd(cmd,this._cwd);
                    });
            })
            //generate xml
            .then(()=>{
                return fileUtils.isFile(pathUtils.join(this._cwd,'config.xml'))
                    //if there is no config.xml generate one
                    .catch(()=>{
                        return this._generateConfigXml();
                    });
            })
            //create package.json if one does not exist
            .then(()=>{
                return Promise.resolve()
                    .then(()=>{
                        return fileUtils.isFile(packageJsonFile)
                    })
                    .catch(()=>{
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
                        return fileUtils.writeContentsToFile(packageJsonFile, JSON.stringify(packageContents,null,'\t'), 0o644 & ~process.umask());
                    });
            })
            //prepare
            .then(()=>{    
                return fileUtils.isDirectory(platformsDir)
                    //plugins are optional therefore you may not have a plugins directory
                    // .then(()=>{    
                    //     return fileUtils.isDirectory(pluginsDir)
                    // })
                    //platforms or plugins does not exist symlink it
                    .catch(()=>{
                        return this._cordovaCmdUtils.prepareCordovaProject();
                    })
            })
            //setup fastlane assets
            .then(()=>{
                return Promise.resolve()
                    .then(()=>{
                        return this._generateFastlaneAssets();
                    })
                    //install all the ruby things
                    .then(()=>{
                        return this._cmdUtils.executeCmd("bundle update");
                    });
            });
    }
    build(targetPlatform='all'){
        this._validateTargetPlatform(targetPlatform);
        return this._fastlaneCmdUtils.executeFastlaneCmd(null,'build',{targetPlatform});
    }
    launch(targetPlatform='all'){
        this._validateTargetPlatform(targetPlatform);
        return this._fastlaneCmdUtils.executeFastlaneCmd(null,'launch',{targetPlatform});
    }
    release(targetPlatform='all'){
        this._validateTargetPlatform(targetPlatform);
        return this._fastlaneCmdUtils.executeFastlaneCmd(null,'release',{targetPlatform});
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