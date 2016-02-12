import { Defaults, WAVEFORMS } from './Constants/Defaults';
const SimpleSynth = require("Tone/instrument/SimpleSynth.js");
const AmplitudeEnvelope = require("Tone/component/AmplitudeEnvelope.js");
const Filter = require("Tone/component/Filter.js");
const LFO = require("Tone/component/LFO.js");
const Analyser = require("Tone/component/Analyser.js");
const Delay = require("Tone/core/Delay.js");
const Note = require("Tone/core/Note.js");
const Master = require("Tone/core/Master.js");

export default class Audio {

	public sources: Tone.SimpleSynth[];
	public filters: Tone.Filter[];
	public delay: Tone.Delay;
	public scuzz: Tone.LFO;

	Init() {

		for (let i = 0; i < Defaults.VoiceCount; i++){
			this.CreateSource();
			this.CreateEnvelope();
			this.CreateFilter();
		}

		this.sources.forEach((source, i: number) => {
			source.connect(filters[i]);
		})

		this.filters.forEach((filter) => {
			filter.connect(delay);
		})

	}

	CreateSource() {
		this.sources.push( new SimpleSynth() );
	}

	CreateFilter() {
		this.filters.push( new AmplitudeEnvelope(
			Defaults.Envelope.attack,
			Defaults.Envelope.decay,
			Defaults.Envelope.sustain,
			Defaults.Envelope.release
		));
	}

	Start(id: number) {
		this.sources[id].envelope.triggerAttack()
	}

	Stop(id: number) {
		this.sources[id].envelope.triggerRelease()
	}

	SetPitch(pitch: number, id: number) {
		this.sources[id].frequency.exponentialRampToValue(pitch, Defaults.SetPitchRampTime);
	}

	SetDelay(value: number) {
		this.delay.delayTime.value = value;
	}

	SetFeedback(value: number) {
		this.delay.feedback.value = value;
	}

	SetScuzz(value: number) {
		this.scuzz.rate.value = value;
	}

}