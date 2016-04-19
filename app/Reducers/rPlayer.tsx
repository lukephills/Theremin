import { PLAYER_STATE_CHANGE } from '../Constants/ActionTypes';
import { IPlayer } from '../Constants/GlobalState';
import { STATE } from '../Constants/AppTypings';

const defaultState = { playerState: STATE.STOPPED }

export const Player = (state = defaultState, action): IPlayer => {
	switch (action.type) {
		case PLAYER_STATE_CHANGE:
			return Object.assign({}, state, {
				playerState: action.playerState
			});
		default:
			return state;
	}
};
