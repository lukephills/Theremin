import {
	ActionType,
	WAVEFORM_CHANGE,
	RECORDER_STATE_CHANGE,
	PLAYER_STATE_CHANGE,
	SLIDER_CHANGE,
	MODAL_CHANGE,
} from '../Constants/ActionTypes';
import {RecordStateType, PlayerStateType} from '../Constants/AppTypings';

export interface IAction {
	type: ActionType;
}

export function Waveform(wave: string): any {
	return {
		type: WAVEFORM_CHANGE,
		wave,
	};
}

export function PlayerStateChange(playerState: PlayerStateType): any {
	return {
		type: PLAYER_STATE_CHANGE,
		playerState,
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

