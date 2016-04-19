import {
	ActionType,
	WAVEFORM_CHANGE,
	RECORDER_STATE_CHANGE,
	PLAYER_STATE_CHANGE,
	SLIDER_CHANGE,
	DOWNLOAD_MODAL_CHANGE, 
	START_MODAL_CHANGE,
	PLAY_BUTTON_DISABLED_CHANGE,
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

export function PlayButtonDisabled(isDisabled: boolean): any {
	return {
		type: PLAY_BUTTON_DISABLED_CHANGE,
		isDisabled,
	}
}

export function SliderAction(sliderName: string, value: number): any {
	return {
		type: SLIDER_CHANGE,
		sliderName,
		value,
	};
}

export function downloadModalChange(value: boolean): any {
	return {
		type: DOWNLOAD_MODAL_CHANGE,
		value,
	};
}

export function startModalChange(value: boolean): any {
	return {
		type: START_MODAL_CHANGE,
		value,
	};
}

