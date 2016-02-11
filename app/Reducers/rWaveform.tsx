import { WAVEFORM_CHANGE } from '../Constants/ActionTypes';
import { Defaults, WAVEFORMS } from '../Constants/Defaults'
import {IWaveform} from '../Constants/GlobalState';

export const Waveform = (state = { wave: WAVEFORMS[Defaults.Waveform] }, action): IWaveform => {
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
