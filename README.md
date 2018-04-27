<a href="https://www.npmjs.com/org/monstermakes/larry-hybrid-app-builder"><img alt="larry-hybrid-app-builder" src="https://nodei.co/npm/larry-hybrid-app-builder.png"/></a>
#larry-hybrid-app-builder

##Description
This project is designed to make a repeatable cordova build based on an existing built web app.

##SETUP
Currently android is only target supported. Make sure you are running on a MAC and that you have the proper environment for building cordova apps setup, see `resources/AndroidCleanInstall.sh`

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