import { Defaults } from '../Constants/Defaults';
import { IRecorder } from '../Constants/GlobalState';
import {RECORDER_TOGGLE} from '../Constants/ActionTypes';

export const Recorder = (state = { isRecording: false }, action): IRecorder => {
	switch (action.type) {
		case RECORDER_TOGGLE:
			return Object.assign({}, state, {
				isRecording: action.isRecording
			});
		default:
			return state;
	}
};
