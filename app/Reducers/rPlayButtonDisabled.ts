import { PLAY_BUTTON_DISABLED_CHANGE } from '../Constants/ActionTypes';
import { IPlayer } from '../Constants/GlobalState';

const defaultState = { playButtonDisabled: true }

export const PlayButtonDisabled = (state = defaultState, action): IPlayer => {
	switch (action.type) {
		case PLAY_BUTTON_DISABLED_CHANGE:
			return Object.assign({}, state, {
				playButtonDisabled: action.isDisabled
			});
		default:
			return state;
	}
};
