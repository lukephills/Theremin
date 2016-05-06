import { START_MODAL_CHANGE } from '../Constants/ActionTypes';
import {IModal} from '../Constants/GlobalState';

//TODO: make this a global check
var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream;
const isOpen = iOS;

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
