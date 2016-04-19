import { IRecorder } from '../Constants/GlobalState';
import {RECORDER_STATE_CHANGE} from '../Constants/ActionTypes';
import {STATE} from '../Constants/AppTypings';

const defaultState = { recordState: STATE.STOPPED }

export const Recorder = (state = defaultState, action): IRecorder => {
	switch (action.type) {
		case RECORDER_STATE_CHANGE:
			return Object.assign({}, state, {
				recordState: action.recordState
			});
		default:
			return state;
	}
};
