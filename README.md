<a href="https://www.npmjs.com/package/@monstermakes/larry-hybrid-app-builder"><img alt="larry-hybrid-app-builder" src="https://nodei.co/npm/larry-hybrid-app-builder.png"/></a>
#larry-hybrid-app-builder

##Description
This project is designed to make a repeatable cordova build based on an existing built web app. Under the covers this uses fastlane (https://docs.fastlane.tools) to do all the heavy lifting. This is designed to run on a MAC ONLY!!!

##SETUP
1. Install cordova
    - npm install -g cordova

###Android
Make sure you are running on a MAC and that you have the proper environment for building cordova apps setup.
The setup for android has been automated please run `resources/AndroidCleanInstall.sh` or use it as a reference to properly setup your environment.

###IOS 
1. Heavily depends on xcode so make sure xcode is installed and up to date, this may require starting xcode and clicking on the install/update steps.

2. Depending on what mutations you add (like push notifications) you may also need cocoapods installed.
```
gem install cocoapods
pod setup
```

3. Create a keychain named `larry-hybrid-app` with password `larry4lyfe`
- this will be used to house all the certs and keys
- make sure its here `~/Library/Keychains/larry-hybrid-app.keychain-db`

###Environment Variables
These environment variables are used for the signing process

- "ANDROID_KEYSTORE": Path to the java keystore file
- "ANDROID_KEYSTORE_ALIAS": alias of the certificate in the java keystore file
- "ANDROID_KEY_PASS": The password used to protect the private key of the java keystore file,If not specified ANDROID_KEYSTORE_PASS will be used.
- "ANDROID_KEYSTORE_PASS": The password of the java keystore file

- "IOS_TEAM_ID": The id of your ios developer team
- "IOS_TEAM_NAME": The name of your ios developer team
- "IOS_EMAIL": The email associated with your ios devloper account
- "FASTLANE_MATCH_GIT_URL": The url to the match git repo to be used for credentials, see https://docs.fastlane.tools/actions/match/ for more details.
- "IOS_SIGNING_IDENTITY": The signing identity to use during the release process, will default to whats found in match if not specified. 
    - example: `iPhone Distribution: Luka Mirosevic (0123456789)`
    - This certificate must be installed into the `larry-hybrid-app` keychain
- "IOS_DEVELOPMENT_PROVISIONING_PROFILE": The signing identity to use during the build process, will default to whats found in match if not specified.
    - This provisioning profile will be installed on the local machine during the release process
- "IOS_APPSTORE_PROVISIONING_PROFILE": The signing identity to use during the release process, will default to whats found in match if not specified.
    - This provisioning profile will be installed on the local machine during the release process

Here is the bashrc exports for convenience:
```
export ANDROID_KEYSTORE="REPLACE_ME"
export ANDROID_KEYSTORE_ALIAS="REPLACE_ME"
export ANDROID_KEY_PASS="REPLACE_ME"
export ANDROID_KEYSTORE_PASS="REPLACE_ME"

export IOS_TEAM_ID="REPLACE_ME"
export IOS_TEAM_NAME="REPLACE_ME"
export IOS_EMAIL="REPLACE_ME"
export FASTLANE_MATCH_GIT_URL="REPLACE_ME"
ecport IOS_SIGNING_IDENTITY="REPLACE_ME"
export IOS_DEVELOPMENT_PROVISIONING_PROFILE="REPLACE_ME"
export IOS_APPSTORE_PROVISIONING_PROFILE="REPLACE_ME"
```

---
###Mocha Tests
Some tests will actually use xcodebuild to produce the ipa, or sign the build so make sure you have the appropriate ENV variables setup:

*hint*: if you use vscode this needs to be in your launch.json
```
{
    "type": "node",
    "request": "launch",
    "name": "HybridAppBuilder.build.spec",
    "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
    "cwd":"${workspaceFolder}/test/build",
    "args": [
        "-u",
        "tdd",
        "--timeout",
        "999999",
        "--colors",
        "${workspaceFolder}/test/build/HybridAppBuilder.build.spec.js"
    ],
    "internalConsoleOptions": "openOnSessionStart",
    "env":{
        "IOS_TEAM_ID": "<ios developer team id>",
        "IOS_TEAM_NAME": "<ios developer team name>",
        "IOS_EMAIL": "<ios developer email>",
        "FASTLANE_MATCH_GIT_URL": "<url to the match git repo>",
        "IOS_SIGNING_IDENTITY": "<signing identity to use instead of Fastlane match>",
        "IOS_PROVISIONING_PROFILE": "<provisioning profile to use instead of Fastlane match>",
        "ANDROID_KEYSTORE": "<Path to the java keystore file>",
        "ANDROID_KEYSTORE_ALIAS": "<alias of the certificate in the java keystore file>",
        "ANDROID_KEY_PASS": "<The password used to protect the private key of the java keystore file>",
        "ANDROID_KEYSTORE_PASS": "<The password of the java keystore file>"
    }
},
```

##RELEASE NOTES
Initial support including:
- setup
    - Validate that a directory is a proper cordova app if not setup/prepare the folder for producing cordova apps.
- build
    - from a previously setup cordova directory kick off a build for a specific target (android/ios) in a specific mode (release/debug)

##TODO
1. Console output / logging
2. Image manipulations
    - generate the splashscreens and cut icons
3. Add named mutations
    - larry core injectables???
4. Add code signing and release capabilities
5. Build out other Mutators...
    - Currently we have Cordova config.xml mutator
    - Would like to Expose a list of generic mutators
        - File mutators
        - XML mutators
        - json mutators