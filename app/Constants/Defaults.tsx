
import {WaveformStringType} from './AppTypings';

export const WAVEFORMS: WaveformStringType[] = [
	'sine',
	'square',
	'triangle',
	'sawtooth',
]

export const DEFAULTS: any = {
	Analyser: {
		maxDecibels: -25,
		minDecibels: -100,
		smoothingTimeConstant: 0.85,
	},
	Envelope: {
		attack: 0.01,
		decay: 0.5,
		sustain: 0.5,
		release: 0.01,
	},
	NoteGuideButton: false,
	PitchMultiplier: 15,
	PitchRampTime: 0.2,
	Sliders: {
		delay: {
			max: 0.5,
			min: 0,
			name: 'delay',
			step: 0.001,
			transformValue: (value) => {
				return (value * 1000).toFixed();
			},
			//value: 0.225,
			value: 0,
		},
		feedback: {
			max: 1,
			min: 0,
			name: 'feedback',
			step: 0.001,
			transformValue: (value) => {
				return (value * 100).toFixed();
			},
			//value: 0.5,
			value: 0,
		},
		scuzz: {
			max: 1000,
			min: 0,
			name: 'scuzz',
			step: 1,
			transformValue: (value) => {
				return value;
			},
			//value: 50,
			value: 0,
			waveform: 'sine',
		},
	},
	Title: 'Theremin',
	VoiceCount: 8,
	Volume: 10,
	Waveform: 2,
}
