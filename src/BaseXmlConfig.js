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
        <icon src="res/icon/ios/icon-20@3x.png" width="60" height="60" />
        <icon src="res/icon/ios/icon-20@2x.png" width="40" height="40" />
        <icon src="res/icon/ios/icon-small.png" width="29" height="29" />
        <icon src="res/icon/ios/icon-small@2x.png" width="58" height="58" />
        <icon src="res/icon/ios/icon-small@3x.png" width="87" height="87" />
        <icon src="res/icon/ios/icon-40@2x.png" width="80" height="80" />
        <icon src="res/icon/ios/icon-60@2x.png" width="120" height="120" />
        <icon src="res/icon/ios/icon.png" width="57" height="57" />
        <icon src="res/icon/ios/icon@2x.png" width="114" height="114" />
        <icon src="res/icon/ios/icon-60@3x.png" width="180" height="180" />
        <icon src="res/icon/ios/icon-20.png" width="20" height="20" />
        <icon src="res/icon/ios/icon-40.png" width="40" height="40" />
        <icon src="res/icon/ios/icon-50.png" width="50" height="50" />
        <icon src="res/icon/ios/icon-50@2x.png" width="100" height="100" />
        <icon src="res/icon/ios/icon-72.png" width="72" height="72" />
        <icon src="res/icon/ios/icon-72@2x.png" width="144" height="144" />
        <icon src="res/icon/ios/icon-76.png" width="76" height="76" />
        <icon src="res/icon/ios/icon-76@2x.png" width="152" height="152" />
        <icon src="res/icon/ios/icon-83.5@2x.png" width="167" height="167" />
        <icon src="res/icon/ios/icon-1024.png" width="1024" height="1024" />
        <icon src="res/icon/ios/AppIcon24x24@2x.png" width="48" height="48" />
        <icon src="res/icon/ios/AppIcon27.5x27.5@2x.png" width="55" height="55" />
        <icon src="res/icon/ios/AppIcon29x29@2x.png" width="58" height="58" />
        <icon src="res/icon/ios/AppIcon29x29@3x.png" width="87" height="87" />
        <icon src="res/icon/ios/AppIcon40x40@2x.png" width="80" height="80" />
        <icon src="res/icon/ios/AppIcon44x44@2x.png" width="88" height="88" />
        <icon src="res/icon/ios/AppIcon86x86@2x.png" width="172" height="172" />
        <icon src="res/icon/ios/AppIcon98x98@2x.png" width="196" height="196" />
        <splash src="res/screen/ios/Default~iphone.png" width="320" height="480" />
        <splash src="res/screen/ios/Default@2x~iphone.png" width="640" height="960" />
        <splash src="res/screen/ios/Default-Portrait~ipad.png" width="768" height="1024" />
        <splash src="res/screen/ios/Default-Portrait@2x~ipad.png" width="1536" height="2048" />
        <splash src="res/screen/ios/Default-568h@2x~iphone.png" width="640" height="1136" />
        <splash src="res/screen/ios/Default-667h.png" width="750" height="1334" />
        <splash src="res/screen/ios/Default-736h.png" width="1242" height="2208" />
        <splash src="res/screen/ios/Default-2436h.png" width="1125" height="2436" />
        <splash src="res/screen/ios/Default@2x~universal~anyany.png" width="2732" height="2732" />
        <splash src="res/screen/ios/Default@3x~universal~anyany.png" width="2208" height="2208" />
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
        <edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest/application/activity[@android:name='MainActivity']">
            <application android:windowSoftInputMode="adjustPan" />
        </edit-config>
        <icon src="res/icon/android/ldpi.png" density="ldpi" />
        <icon src="res/icon/android/hdpi.png" density="hdpi" />
        <icon src="res/icon/android/mdpi.png" density="mdpi" />
        <icon src="res/icon/android/xhdpi.png" density="xhdpi" />
        <icon src="res/icon/android/xxhdpi.png" density="xxhdpi" />
        <icon src="res/icon/android/xxxhdpi.png" density="xxxhdpi" />        
        <splash src="res/screen/android/splash-port-ldpi.png" density="port-ldpi" />
        <splash src="res/screen/android/splash-port-mdpi.png" density="port-mdpi" />
        <splash src="res/screen/android/splash-port-hdpi.png" density="port-hdpi" />
        <splash src="res/screen/android/splash-port-xhdpi.png" density="port-xhdpi" />
        <splash src="res/screen/android/splash-port-xxhdpi.png" density="port-xxhdpi" />
        <splash src="res/screen/android/splash-port-xxxhdpi.png" density="port-xxxhdpi" />
    </platform>
    <plugin name="cordova-plugin-device" spec="^2.0.2" />
    <plugin name="cordova-plugin-jailbreak-detection" spec="^0.1.0" />
    <plugin name="cordova.plugins.diagnostic" spec="^4.0.5" />
    <plugin name="cordova-plugin-splashscreen" spec="^5.0.2" />
    <plugin name="cordova-plugin-safariviewcontroller" spec="^1.5.3" />
    <plugin name="cordova-plugin-whitelist" spec="^1.3.3" />
</widget>
`;