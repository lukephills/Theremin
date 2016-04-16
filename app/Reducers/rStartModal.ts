import { START_MODAL_CHANGE } from '../Constants/ActionTypes';
import {IModal} from '../Constants/GlobalState';
import {isCordovaIOS} from '../Utils/utils';

const isOpen = isCordovaIOS();

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
