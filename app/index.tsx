import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import "babel-polyfill";
require('normalize.css');

import configureStore from './configureStore';
import App from './Components/App';

//Initialize app with start data
const initialState: any = {};

const store: any = configureStore(initialState || {});

class Main extends React.Component<{}, {}> {

	public render(): React.ReactElement<Provider> {
		return (
			<Provider store={store}>
				<App />
			</Provider>
		);
	}
}



const startApp = () => {
	console.log('starting app...');
	ReactDOM.render(<Main/>, document.getElementById('app'));
}

declare var LocalFileSystem: any;
// interface Window {
// 	appRootDirName: string;
// 	appRootDir: string;
// }

const deviceReady = () => {
	cordova
	console.log('Using Cordova!');
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

	startApp();
}

(window as any).appRootDirName = ".myapp";

function fail() {
	console.log("failed to get filesystem");
}

function gotFS(fileSystem) {
	console.log("filesystem got");
	cordova.file.documentsDirectory;
	fileSystem.root.getDirectory((window as any).appRootDirName, {
		create : true,
		exclusive : false
	}, dirReady, fail);
}

function dirReady(entry) {
	(window as any).appRootDir = entry;
	console.log(JSON.stringify((window as any).appRootDir));
}


if (window.cordova) {
	console.log('cordova exists')
	document.addEventListener('deviceready', deviceReady, false);
} else {
	startApp();
}

// somewhere in your app
// if(window.device && device.platform === 'iOS') {
// 	styles.base.paddingTop = '20px'
// }
