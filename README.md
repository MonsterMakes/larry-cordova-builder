<a href="https://www.npmjs.com/package/@monstermakes/larry-hybrid-app-builder"><img alt="larry-hybrid-app-builder" src="https://nodei.co/npm/larry-hybrid-app-builder.png"/></a>
#larry-hybrid-app-builder

##Description
This project is designed to make a repeatable cordova build based on an existing built web app. Under the covers this uses fastlane (https://docs.fastlane.tools) to do all the heavy lifting. This is designed to run on a MAC ONLY!!!

##SETUP
###Android
Make sure you are running on a MAC and that you have the proper environment for building cordova apps setup, see `resources/AndroidCleanInstall.sh`

###IOS 
Heavily depends on xcode so make sure xcode is installed and up to date, this may require starting xcode and clikcing on the install/update steps.

Some tests will actually use xcodebuild to produce the ipa, so make sure you have the following ENV variables setup:
- "IOS_TEAM_ID": The id of your ios developer team
- "IOS_TEAM_NAME": The name of your ios developer team
- "IOS_EMAIL": The email associated with your ios devloper account
- "FASTLANE_MATCH_GIT_URL": The url to the match git repo to be used for credentials, see https://docs.fastlane.tools/actions/match/ for more details.

*hint*: if you use vscode this needs to be in your launch.json
```
"env":{
    "IOS_TEAM_ID": "<ios developer team id>",
    "IOS_TEAM_NAME": "<ios developer team name>",
    "IOS_EMAIL": "<ios developer email>",
    "FASTLANE_MATCH_GIT_URL": "<url to the match git repo>"
},
```

###Mocha Tests
To run the specs from within vscode please mind the "cwd"
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
    "internalConsoleOptions": "openOnSessionStart"
},
```


##RELEASE NOTES
Initial support including:
- setup
    - Validate that a direcotry is a proper cordova app if not setup/prepare the folder for producing cordova apps.
- build
    - from a previously setup cordova directory kick off a build for a specific target (android/ios) in a specific mode (release/debug)

##TODO
1. Console output / logging
2. Image manipulations
    - generate the splashscreens and cut icons
3. Add named mutations
    - larry core injectables???
4. Add code signing and release capabilities