export interface IGlobalState {
	NoteGuide?: INoteGuide;
	Waveform?: IWaveform;
	Player?: IPlayer;
	Recorder?: IRecorder;
	Slider?: ISlider;
}

export interface INoteGuide {
	isOn?: boolean;
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