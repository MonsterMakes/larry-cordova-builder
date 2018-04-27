module.exports=`<?xml version='1.0' encoding='utf-8'?>
<widget xmlns="http://www.w3.org/ns/widgets" xmlns:android="http://schemas.android.com/apk/res/android" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <author email="info@auctionfrontier.com" href="https://www.auctionfrontier.com/">
        Auction Frontier
    </author>
    <content src="index.html" />
    <allow-navigation href="*" />
    <allow-intent href="*" />
    <access origin="*" />
    <preference name="BackupWebStorage" value="none" />
    <preference name="DisallowOverscroll" value="true" />
    <preference name="UIWebViewBounce" value="false" />
    <preference name="Orientation" value="portrait" />
    <preference name="SplashScreen" value="screen" />
    <preference name="AutoHideSplashScreen" value="false" />
    <preference name="SplashScreenSpinnerColor" value="white" />
    <preference name="TopActivityIndicator" value="white" />
    <engine name="android" spec="^7.0.0" />

    <platform name="android">
        <allow-intent href="market:*" />
        <preference name="AndroidPersistentFileLocation" value="Compatibility" />
        <icon density="ldpi" src="res/icon/android/ldpi.png" />
        <icon density="mdpi" src="res/icon/android/mdpi.png" />
        <icon density="hdpi" src="res/icon/android/hdpi.png" />
        <icon density="xhdpi" src="res/icon/android/xhdpi.png" />
        <icon density="xxhdpi" src="res/icon/android/xxhdpi.png" />
        <icon density="xxxhdpi" src="res/icon/android/xxxhdpi.png" />
        <splash density="port-ldpi" src="res/screen/android/splash-port-ldpi.png" />
        <splash density="port-mdpi" src="res/screen/android/splash-port-mdpi.png" />
        <splash density="port-hdpi" src="res/screen/android/splash-port-hdpi.png" />
        <splash density="port-xhdpi" src="res/screen/android/splash-port-xhdpi.png" />
        <splash density="port-xxhdpi" src="res/screen/android/splash-port-xxhdpi.png" />
        <splash density="port-xxxhdpi" src="res/screen/android/splash-port-xxxhdpi.png" />
        <edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest/application">
            <application android:allowBackup="false" />
        </edit-config>
    </platform>
    <plugin name="cordova-plugin-device" spec="^2.0.2" />
    <plugin name="cordova-plugin-jailbreak-detection" spec="^0.1.0" />
    <plugin name="cordova.plugins.diagnostic" spec="^4.0.5" />
    <plugin name="cordova-plugin-splashscreen" spec="^5.0.2" />
    <plugin name="cordova-plugin-safariviewcontroller" spec="^1.5.3" />
    <plugin name="cordova-plugin-whitelist" spec="^1.3.3" />
</widget>
`;