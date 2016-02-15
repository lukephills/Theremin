import { Defaults, WAVEFORMS } from './Constants/Defaults';
const SimpleSynth = require("Tone/instrument/SimpleSynth.js");
const AmplitudeEnvelope = require("Tone/component/AmplitudeEnvelope.js");
const Filter = require("Tone/component/Filter.js");
const LFO = require("Tone/component/LFO.js");
const Analyser = require("Tone/component/Analyser.js");
const Delay = require("Tone/core/Delay.js");
const Note = require("Tone/core/Note.js");
const Master = require("Tone/core/Master.js");

class Audio {

	public sources: Tone.SimpleSynth[] = [];
	public filters: Tone.Filter[] = [];
	public delay: Tone.Delay;
	public scuzz: Tone.LFO;

	constructor() {

		for (let i = 0; i < Defaults.VoiceCount; i++){
			this.CreateSource();
			this.CreateFilter();
		}

		this.sources.forEach((source, i: number) => {
			source.connect(this.filters[i]);
		})

		this.delay = new Delay();
		this.scuzz = new LFO();

		this.filters.forEach((filter) => {
			filter.connect(this.delay);
		})

		this.delay.toMaster();

	}

	CreateSource() {
		this.sources.push( new SimpleSynth() );
	}

	CreateFilter() {
		this.filters.push( new Filter());
	}

	public Start(id: number = 0) {
		this.sources[id].triggerAttack(440)
	}

	public Stop(id: number = 0) {
		this.sources[id].triggerRelease()
	}

	SetPitch(pitch: number, id: number = 0) {
		this.sources[id].frequency.exponentialRampToValue(pitch, Defaults.SetPitchRampTime);
	}

	SetDelay(value: number) {
		this.delay.delayTime.value = value;
	}

	SetFeedback(value: number) {
		//this.delay.feedback.value = value;
	}

	SetScuzz(value: number) {
		//this.scuzz.rate.value = value;
	}

}
export default Audio;
