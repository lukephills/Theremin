import {
	ActionType,
	WAVEFORM_CHANGE,
	RECORDER_STATE_CHANGE,
	PLAYER_TOGGLE,
	SLIDER_CHANGE,
	MODAL_CHANGE,
} from '../Constants/ActionTypes';
import {RecordStateType} from '../Constants/AppTypings';

export interface IAction {
	type: ActionType;
}

export function Waveform(wave: string): any {
	return {
		type: WAVEFORM_CHANGE,
		wave,
	};
}

export function Player(isPlaying: boolean): any {
	return {
		type: PLAYER_TOGGLE,
		isPlaying,
	};
}

export function RecorderStateChange(recordState: RecordStateType): any {
	return {
		type: RECORDER_STATE_CHANGE,
		recordState,
	};
}

export function SliderAction(sliderName: string, value: number): any {
	return {
		type: SLIDER_CHANGE,
		sliderName,
		value,
	};
}

export function modalChange(value: boolean): any {
	return {
		type: MODAL_CHANGE,
		value,
	};
}

