module.exports=`<?xml version='1.0' encoding='utf-8'?>
<widget xmlns="http://www.w3.org/ns/widgets" xmlns:android="http://schemas.android.com/apk/res/android" xmlns:cdv="http://cordova.apache.org/ns/1.0" xmlns:tools="http://schemas.android.com/tools">
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
    <engine name="ios" spec="^4.5.4" />
    <platform name="ios">
        <config-file mode="add" parent="ITSAppUsesNonExemptEncryption" target="*-Info.plist">
            <false />
        </config-file>
        <icon height="57" platform="ios" src="res/icon/ios/icon.png" width="57" />
        <icon height="114" platform="ios" src="res/icon/ios/icon@2x.png" width="114" />
        <icon height="40" platform="ios" src="res/icon/ios/icon-40.png" width="40" />
        <icon height="80" platform="ios" src="res/icon/ios/icon-40@2x.png" width="80" />
        <icon height="50" platform="ios" src="res/icon/ios/icon-50.png" width="50" />
        <icon height="100" platform="ios" src="res/icon/ios/icon-50@2x.png" width="100" />
        <icon height="60" platform="ios" src="res/icon/ios/icon-60.png" width="60" />
        <icon height="120" platform="ios" src="res/icon/ios/icon-60@2x.png" width="120" />
        <icon height="180" platform="ios" src="res/icon/ios/icon-60@3x.png" width="180" />
        <icon height="72" platform="ios" src="res/icon/ios/icon-72.png" width="72" />
        <icon height="144" platform="ios" src="res/icon/ios/icon-72@2x.png" width="144" />
        <icon height="76" platform="ios" src="res/icon/ios/icon-76.png" width="76" />
        <icon height="152" platform="ios" src="res/icon/ios/icon-76@2x.png" width="152" />
        <icon height="29" platform="ios" src="res/icon/ios/icon-small.png" width="29" />
        <icon height="58" platform="ios" src="res/icon/ios/icon-small@2x.png" width="58" />
        <icon height="87" platform="ios" src="res/icon/ios/icon-small@3x.png" width="87" />
        <splash src="res/screen/ios/Default@2x~universal~anyany.png" />
    </platform>
    <engine name="android" spec="^7.0.0" />
    <platform name="android">
        <preference name="AndroidPersistentFileLocation" value="Compatibility" />
        <edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest/application">
            <application android:allowBackup="false" tools:replace="android:allowBackup" />
        </edit-config>
        <edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest">
            <manifest xmlns:tools="http://schemas.android.com/tools" />
        </edit-config>
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
    </platform>
    <plugin name="cordova-plugin-device" spec="^2.0.2" />
    <plugin name="cordova-plugin-jailbreak-detection" spec="^0.1.0" />
    <plugin name="cordova.plugins.diagnostic" spec="^4.0.5" />
    <plugin name="cordova-plugin-splashscreen" spec="^5.0.2" />
    <plugin name="cordova-plugin-safariviewcontroller" spec="^1.5.3" />
    <plugin name="cordova-plugin-whitelist" spec="^1.3.3" />
</widget>
`;