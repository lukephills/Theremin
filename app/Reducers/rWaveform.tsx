import { WAVEFORM_CHANGE } from '../Constants/ActionTypes';
import { DEFAULTS, WAVEFORMS } from '../Constants/Defaults'
import {IWaveform} from '../Constants/GlobalState';

export const Waveform = (state = { wave: WAVEFORMS[DEFAULTS.Waveform] }, action): IWaveform => {
	switch (action.type) {
		case WAVEFORM_CHANGE:
			return Object.assign({},
				state, {
				wave: action.wave
			});
		default:
			return state;
	}
};
