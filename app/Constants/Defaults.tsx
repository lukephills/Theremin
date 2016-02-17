export const WAVEFORMS: string[] = [
	'sine',
	'square',
	'triangle',
	'sawtooth',
]

export const Defaults: any = {
	Title: 'Theremin',
	Waveform: 2,
	VoiceCount: 8,
	Envelope: {
		attack: 0.01,
		decay: 0.5,
		sustain: 0.5,
		release: 0.01,
	},
	Volume: 10,
	PitchMultiplier: 15,
	PitchRampTime: 0.2,
	NoteGuideButton: false,
	Sliders: {
		delay: {
			name: 'delay',
			value: 0.225,
			min: 0,
			max: 0.5,
			step: 0.001,
			transformValue: (value) => {
				return (value * 1000).toFixed();
			},
		},
		feedback: {
			name: 'feedback',
			value: 0.5,
			min: 0,
			max: 1,
			step: 0.001,
			transformValue: (value) => {
				return (value * 100).toFixed();
			},
		},
		scuzz: {
			name: 'scuzz',
			value: 50,
			min: 0,
			max: 1000,
			step: 1,
			waveform: 'sine',
			transformValue: (value) => {
				return value;
			},
		},
	}
}
