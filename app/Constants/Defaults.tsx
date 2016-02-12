export const WAVEFORMS: string[] = [
	'sine',
	'square',
	'triangle',
	'saw',
]

export const Defaults: any = {
	Title: 'Theremin',
	NoteGuideButton: false,
	Waveform: 1,
	Sliders: [
		{
			name: 'delay',
			value: 2,
			min: 0,
			max: 100,
			step: 0.1,
		},
		{
			name: 'feedback',
			value: 100,
			min: 0,
			max: 100,
			step: 0.1,
		},
		{
			name: 'scuzz',
			value: 50,
			min: 0,
			max: 100,
			step: 0.1,
		},
	]
}
