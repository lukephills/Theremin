import { MODAL_CHANGE } from '../Constants/ActionTypes';
import {IModal} from '../Constants/GlobalState';

export const Modal = (state = { isOpen: false }, action): IModal => {
	switch (action.type) {
		case MODAL_CHANGE:
			return Object.assign({}, state, {
				isOpen: action.value
			});
		default:
			return state;
	}
};
