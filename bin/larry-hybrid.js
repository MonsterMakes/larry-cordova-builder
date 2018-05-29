#!/usr/bin/env node
'use strict';
const HybridAppBuilder = require("../index").HybridAppBuilder;
const vorpal = require('vorpal')();
const _ = require("lodash");
const pathUtils = require("path");

function initializeHybridAppBuilder(args) {
	return new Promise(function(resolve, reject) {
		let config = {};

		//Raw config file is specified
		if(args.options.config) {
			try{
				config = require(pathUtils.resolve(args.options.config));
			}
			catch(e){
				reject(new Error(`Config File (${args.options.config}) Not Found! You must supply a valid path to a json file.`));
			}
		}
		//Specifc working directory is specified
		if(args.options.cwd) {
			config.cwd = args.options.cwd;
		}
		//A custom property in the package.json to house the config
		if(args.options.packageProperty) {
			config.usePackageJsonConfigName = args.options.packageProperty;
		}
		//Custom location to find the package.json
		if(args.options.packageJson) {
			config.usePackageJsonCustomLocation = pathUtils.resolve(args.options.packageJson);
		}
		//Custom location to the webPackagelocation
		if(args.options.webPackageLocation){
			config.webPackageLocation = pathUtils.resolve(args.options.webPackageLocation);
		}
		vorpal.log('Using this configuration:\n'+JSON.stringify(config,null,'\t'));
		let hybridAppBuilder = new HybridAppBuilder(config);
		
		resolve(hybridAppBuilder);
	});
}

vorpal
	.command('release', 'Will release your hybrid app, this includes signing.')
	.option('--target <target>', 'The target platform to be built.')
	.option('--config <config>', 'Path to the json file to configure the build.')
	.option('--cwd <cwd>', 'The working directory to use instead of the current directory.')
	.option('--packageProperty <packageProperty>', 'The property within the package.json file that contains configuration.')
	.option('--packageJson <packageJson>', 'The path to the package.json file to use for configuration.')
	.option('--webPackageLocation <webPackageLocation>','The path to the web package location to use for configuration.')
	.action(function(args){
		let hybridAppBuilder;
		
		let target = 'all';
		if(args.options.target) {
			target = args.options.target;
		}
		return initializeHybridAppBuilder(args)
			.then((hab) => {
				hybridAppBuilder = hab;	
				return hybridAppBuilder.setupBuild();
			})
			.then(() => {
				return hybridAppBuilder.build(target);
			})
			.then(() => {
				return hybridAppBuilder.release(target);
			});
	});

vorpal
	.command('launch', 'Will launch your hybrid app on a device.')
	.option('--target <target>', 'The target platform to be built.')
	.option('--config <config>', 'Path to the json file to configure the build.')
	.option('--cwd <cwd>', 'The working directory to use instead of the current directory.')
	.option('--packageProperty <packageProperty>', 'The property within the package.json file that contains configuration.')
	.option('--packageJson <packageJson>', 'The path to the package.json file to use for configuration.')
	.option('--webPackageLocation <webPackageLocation>','The path to the web package location to use for configuration.')
	.action(function(args){
		let target = undefined;
		return Promise.resolve()
			.then(()=>{
				if(args.options.target) {
					target = args.options.target;
				}
				else{
					return Promise.reject(new Error("You must supply a target (ios, android) to the launch command!"))
				}
			})
			.then(()=>{
				return initializeHybridAppBuilder(args);
			})
			.then((hybridAppBuilder) => {
				return hybridAppBuilder.launch(target);
			});
	});

vorpal
	.command('build', 'Will build your hybrid app, all platforms unless --target is used.')
	.option('--target <target>', 'The target platform to be built.')
	.option('--config <config>', 'Path to the json file to configure the build.')
	.option('--cwd <cwd>', 'The working directory to use instead of the current directory.')
	.option('--packageProperty <packageProperty>', 'The property within the package.json file that contains configuration.')
	.option('--packageJson <packageJson>', 'The path to the package.json file to use for configuration.')
	.option('--webPackageLocation <webPackageLocation>','The path to the web package location to use for configuration.')
	.action(function(args){
		let hybridAppBuilder;
		return initializeHybridAppBuilder(args)
			.then((appBuilder) => {
				hybridAppBuilder = appBuilder;
			})
			.then(() => {
				return hybridAppBuilder.setupBuild();
			})
			.then(() => {
				let target = 'all';
				if(args.options.target) {
					target = args.options.target;
				}
				return hybridAppBuilder.build(target);
			})
			.then(() => {
				vorpal.log('Your App has been successfully built.');
				return Promise.resolve();
			});
	});

vorpal
	.command('setup', 'Will setup your hybrid app.')
	.option('--config <config>', 'Path to the json file to configure the build.')
	.option('--cwd <cwd>', 'The working directory to use instead of the current directory.')
	.option('--packageProperty <packageProperty>', 'The property within the package.json file that contains configuration.')
	.option('--packageJson <packageJson>', 'The path to the package.json file to use for configuration.')
	.option('--webPackageLocation <webPackageLocation>','The path to the web package location to use for configuration.')
	.action(function(args){
		let hybridAppBuilder;
		return initializeHybridAppBuilder(args)
			.then((appBuilder) => {
				hybridAppBuilder = appBuilder;
			})
			.then(() => {
				return hybridAppBuilder.setupBuild();
			})
			.then(()=>{
				vorpal.log('Your App has been successfully setup.')
				return Promise.resolve();
			});
	});
	
const parsedArgs = vorpal.parse(process.argv, {use: 'minimist'});
const interactive = parsedArgs._ === undefined;
if(interactive){
	vorpal
		.delimiter(vorpal.chalk.blue('larry-hybrid>'))
		.log('\u001b[2J\u001b[0;0H')
		.show();
}
else{
	// argv is mutated by the first call to parse.
	process.argv.unshift('');
	process.argv.unshift('');
	vorpal
		.log("Executing command directly: "+parsedArgs._)
		.on('client_command_executed', evt => process.exit(0))
		.delimiter('')
		.parse(process.argv);
}