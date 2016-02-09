import { createStore, applyMiddleware, compose } from 'redux';
import Logger from './Middleware/Logger';
import rootReducer from './Reducers/root';

declare const module: IHotModule;
interface IHotModule {
	hot?: { accept: (path: string, callback: () => void) => void };
};

// List all middleware for development
const middleware = [Logger]

const enhancer = compose(
	applyMiddleware(...middleware)
);


// Create the store
export default function configureStore(initialState) {
	const store = createStore(rootReducer, initialState, enhancer);

		if (module.hot) {
		// Enable Webpack hot module replacement for reducers
		module.hot.accept('./Reducers/root', () => {
			const nextRootReducer = require('./Reducers/root').default;
			store.replaceReducer(nextRootReducer);
		});
	}
	return store;
}
