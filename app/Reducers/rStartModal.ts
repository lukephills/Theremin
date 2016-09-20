import { START_MODAL_CHANGE } from '../Constants/ActionTypes';
import {IModal} from '../Constants/GlobalState';
import {isCordova, isIOS} from '../Utils/utils';

// Only open for cordova or ios webpages
const isOpen = isCordova() || isIOS();

export const StartModal = (state = { isOpen }, action): IModal => {
	switch (action.type) {
		case START_MODAL_CHANGE:
			return Object.assign({}, state, {
				isOpen: action.value
			});
		default:
			return state;
	}
};
