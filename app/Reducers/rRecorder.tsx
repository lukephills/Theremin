import { DEFAULTS } from '../Constants/Defaults';
import { IRecorder } from '../Constants/GlobalState';
import {RECORDER_STATE_CHANGE} from '../Constants/ActionTypes';

const defaultState = { recordState: 'stopped' }

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
