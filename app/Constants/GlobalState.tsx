export interface IGlobalState {
	Waveform?: IWaveform;
	Player?: IPlayer;
	Recorder?: IRecorder;
	Slider?: ISlider;
	Modal?: IModal;
}

export interface IWaveform {
	wave?: string;
}

export interface IPlayer {
	isPlaying?: boolean;
}

export interface IRecorder {
	isRecording?: boolean;
}

export interface ISlider {
	delay?: number;
	feedback?: number;
	scuzz?: number;
}

export interface IModal {
	isOpen?: boolean;
}