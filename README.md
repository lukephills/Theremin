Copyright, Luke Phillips 2016    
http://femurdesign.com

`npm start` to serve and watch on `localhost:3000`      
`npm run build` to create build folder for chrome     
`npm run ios` to build for xcode     
`npm run android` to build for android      
`npm run all` to build all platforms   
`npm run icons` to create icons & splashes
`npm run electron` to start an electron window

When updating bump versions in 3 places:
- package.json
- manifest.json
- phonegap/theremin/config.xml


Android uses `cordova-plugin-crosswalk-webview` for the latest Chromium webview to support v4.0+.
IOS uses `Cordova WKWebView Engine` to use the WKWebView component instead of the default UIWebView component, and is installable only on a system with the iOS 9.0 SDK.