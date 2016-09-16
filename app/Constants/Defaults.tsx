
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
			startTextMain: `I've made an app that loops, records and downloads!`,
			recorderOnlyWorksInPaidVersionMain: `Record, loop and download only work in the app!`,
			startTextSecondary: `Available for iphone/ipad from the Apple Store, or any desktop computers using Chrome.`,
			recorderOnlyWorksInPaidVersionSecondary: `Available for iphone/ipad from the Apple Store, or any desktop computers using Chrome.`,
			resumeText: 'Continue with free version',
			downloadPrompt: 'Would you like to download your recording?',
		},
	},
	Links: {
		iosAppStore: 'http://geo.itunes.apple.com/us/app/theremin-synth-loop-record/id1104816326?mt=8',
		chromeAppStore: 'http://chrome.google.com/webstore/detail/theremin/ghajldemkobafmgejbnjpeohpifhkhjd',
		androidAppStore: 'http://android.com',
		femur: 'https://femurdesign.com',
		homepage: 'https://femurdesign.com/theremin',
	},
	VoiceCount: 8,
	Volume: 10,
	Waveform: 2,
}
