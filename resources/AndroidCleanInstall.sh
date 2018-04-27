#!/bin/bash

if brew ls --versions > /dev/null; then
	if brew cask ls --versions > /dev/null; then
		say "Updating Brew"
		brew update
		brew tap caskroom/versions

		sleep 1;
		say "Wiping out Android Studio"
		rm -Rf /Applications/Android\ Studio.app
		rm -Rf ~/Library/Preferences/AndroidStudio*
		rm -Rf ~/Library/Preferences/com.google.android.*
		rm -Rf ~/Library/Preferences/com.android.*
		rm -Rf ~/Library/Application\ Support/AndroidStudio*
		rm -Rf ~/Library/Logs/AndroidStudio*
		rm -Rf ~/Library/Caches/AndroidStudio*
		rm -Rf ~/.AndroidStudio*

		sleep 1;
		say "Installing Java 8 via brew"
		brew cask install java8
		echo  'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.bashrc 

		sleep 1;
		say "Installing Gradle via brew"
		brew install gradle
		echo 'export GRADLE_HOME="$(brew info gradle | grep /usr/local/Cellar/gradle | awk '"'"'{print $1}'"'"')/libexec"' >> ~/.bashrc
		say "Please make sure gradle version is 4.6"

		sleep 1;
		say "Installing Android SDK via brew"
		brew cask install android-sdk
		echo 'export ANDROID_SDK_ROOT="/usr/local/share/android-sdk"' >> ~/.bashrc
		echo 'export ANDROID_HOME=$ANDROID_SDK_ROOT' >> ~/.bashrc

		sleep 1;
		say "Updating Android SDK Manager"
		sdkmanager --update
		sdkmanager "platform-tools"
		sdkmanager "platforms;android-26"
		sdkmanager "build-tools;27.0.3"
		echo 'PATH=$PATH:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/build-tools/27.0.3' >> ~/.bashrc

		sleep 1;
		say "Installing Android Studio"
		brew cask install android-studio

		sleep 1;
		say "You are now ready to do mobile things"
	else 
		say "Brew cask  must be installed first"
	fi
else 
	say "Brew must be installed first"
fi
