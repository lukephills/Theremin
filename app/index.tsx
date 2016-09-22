import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import "babel-polyfill";

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
	// Prevent touch scroll event on document //
	document.addEventListener('touchmove', e => e.preventDefault(), false);

	// Render App to DOM //
	ReactDOM.render(<Main/>, document.getElementById('app'));
};

const deviceReady = () => {
	setTimeout(() => {
		navigator.splashscreen.hide();
		startApp();
	}, 2000);
};

if (window.cordova) {
	document.addEventListener('deviceready', deviceReady, false);
} else {
	startApp();
}
