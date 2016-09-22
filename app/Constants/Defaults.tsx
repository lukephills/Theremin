
import {WaveformStringType} from './AppTypings';

export const WAVEFORMS: WaveformStringType[] = [
	'sine',
	'square',
	'triangle',
	'sawtooth',
];

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
			unTransformValue: (value) => {
				return (value/1000).toFixed();
			},
			value: 0.225,
		},
		feedback: {
			max: 1,
			min: 0,
			name: 'feedback',
			step: 0.001,
			transformValue: (value) => {
				return (value * 100).toFixed();
			},
			unTransformValue: (value) => {
				return (value/100).toFixed();
			},
			value: 0.5,
		},
		scuzz: {
			max: 1000,
			min: 0,
			name: 'scuzz',
			step: 1,
			transformValue: (value) => {
				return (value).toFixed();
			},
			unTransformValue: (value) => {
				return (value).toFixed();
			},
			value: 50,
			waveform: 'sine',
		},
	},
	Title: 'Theremin',
	Copy: {
		en: {
			renderingAudio: 'Rendering audio file. Please wait...',
			filename: 'theremin.wav',
			recordingTooLong: 'The recording is too large. Try a shorter length.',
			cantShare: `Can't share file`,
			sharePrompt: 'Would you like to share your recording?',
			startTextMain: `Get the app`,
			recorderOnlyWorksInPaidVersionMain: `Recorder / Looper only works in the app. Get it here:`,
			startTextSecondary: '',
			recorderOnlyWorksInPaidVersionSecondary: ``,
			resumeText: 'Continue with free version',
			downloadPrompt: 'Would you like to download your recording?',
		},
	},
	Links: {
		iosAppStore: 'https://itunes.apple.com/app/theremin-synth-loop-record/id1104816326',
		chromeAppStore: 'https://chrome.google.com/webstore/detail/theremin/ghajldemkobafmgejbnjpeohpifhkhjd',
		androidAppStore: 'https://play.google.com/store/apps/details?id=com.femurdesign.theremin',
		femur: 'https://femurdesign.com',
		homepage: 'https://femurdesign.com/theremin',
	},
	VoiceCount: 8,
	Volume: 10,
	Waveform: 2,
};
