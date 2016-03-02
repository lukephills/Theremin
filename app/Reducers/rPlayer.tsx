import { PLAYER_TOGGLE } from '../Constants/ActionTypes';
import { DEFAULTS } from '../Constants/Defaults';
import { IPlayer } from '../Constants/GlobalState';

export const Player = (state = { isPlaying: false }, action): IPlayer => {
	switch (action.type) {
		case PLAYER_TOGGLE:
			return Object.assign({}, state, {
				isPlaying: action.isPlaying
			});
		default:
			return state;
	}
};
