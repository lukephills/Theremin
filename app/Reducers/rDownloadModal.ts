import { DOWNLOAD_MODAL_CHANGE } from '../Constants/ActionTypes';
import {IModal} from '../Constants/GlobalState';

export const DownloadModal = (state = { isOpen: false }, action): IModal => {
	switch (action.type) {
		case DOWNLOAD_MODAL_CHANGE:
			return Object.assign({}, state, {
				isOpen: action.value
			});
		default:
			return state;
	}
};
