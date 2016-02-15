import { Defaults, WAVEFORMS } from './Constants/Defaults';
import {ICoordinates} from './Components/MultiTouchView';
import {STYLE_CONST, style} from './Components/Styles/styles';
//const SimpleSynth = require("Tone/instrument/SimpleSynth.js");
//const AmplitudeEnvelope = require("Tone/component/AmplitudeEnvelope.js");
//const Filter = require("Tone/component/Filter.js");
//const LFO = require("Tone/component/LFO.js");
//const Analyser = require("Tone/component/Analyser.js");
//const Delay = require("Tone/core/Delay.js");
//const Note = require("Tone/core/Note.js");
const Tone = require("Tone/core/Tone.js");

class Audio {



	private _clientHeight: number;
	//private _pitchMultiplier: number = Defaults.PitchMultiplier
	private frequencyMultiplier: number = 15;
	private _lastFrequency: number = 320; //TODO: add to defaults
	private mySpectrum;

	public Tone: Tone = new Tone();
	public context: AudioContext = this.Tone.context;

	// Gains
	public _volume: GainNode = this.context.createGain()
	public oscillatorGain: GainNode = this.context.createGain()
	public masterVolume: GainNode = this.context.createGain()
	public scuzzGain: GainNode = this.context.createGain()

	// Effects
	public filter: BiquadFilterNode = this.context.createBiquadFilter();
	public delay: DelayNode = this.context.createDelay();
	public feedback: GainNode = this.context.createGain();
	public compressor: DynamicsCompressorNode = this.context.createDynamicsCompressor();

	// Analyser
	public audioAnalyser: AnalyserNode = this.context.createAnalyser();

	// Oscillators
	public oscillator = this.context.createOscillator();
	public scuzz = this.context.createOscillator();




	get clientHeight(): number {
		return this._clientHeight;
	}
	set clientHeight(height) {
		this._clientHeight = height;
	}


	constructor() {

		this.routeSounds();
		this.audioAnalyser.smoothingTimeConstant = 0.85;
		this.animateSpectrum();
	}

	routeSounds() {

		//this.setWaveform('square');
		this.oscillator.type = 'square';
		this.filter.type = 'lowpass';

		// Set slider values
		this.delay.delayTime.value = 0.225;
		this.feedback.gain.value = 0.5;
		this.scuzzGain.gain.value = 0;

		//this._volume.gain.value = 0.6;
		this.oscillatorGain.gain.value = 0;
		this.masterVolume.gain.value = 0.5;


		this.scuzz.frequency.value = 400;
		this.scuzz.type = 'sine';

		// Connect the Scuzz
		this.scuzz.connect(this.scuzzGain);

		//TODO: CHECK THIS
		// Previously this:
		// this.scuzzVolume.connect(this.source.frequency);
		// But changed to this to fix older safari bug
		this.scuzzGain.connect(<any>this.oscillator.detune);

		this.oscillator.connect(this.oscillatorGain);
		this.oscillatorGain.connect(this.filter);

		this.filter.connect(this.compressor);
		this.filter.connect(this.delay);

		this.delay.connect(this.feedback);
		this.delay.connect(this.compressor);
		this.feedback.connect(this.delay);

		this.compressor.connect(this.masterVolume);
		this.masterVolume.connect(this.audioAnalyser);
		this.audioAnalyser.connect(this.context.destination);

		//Start oscillators
		this.scuzz.start(0);
		this.oscillator.start(0);
	}

	Start(pos: ICoordinates){
		this.SetFilterFrequency(pos.y);
		this.oscillatorGain.gain.value = 1;
		this.oscillator.frequency.value = pos.x * this.frequencyMultiplier;
	}

	Stop(pos: ICoordinates) {
		this.oscillator.frequency.value = pos.x * this.frequencyMultiplier;
		this.oscillatorGain.gain.value = 0;
	}

	Move(pos: ICoordinates) {
		this.oscillator.frequency.value = pos.x * this.frequencyMultiplier;
		this.SetFilterFrequency(pos.y);
	}

	SliderChange(slider) {
		switch (slider) {
			case 'delay':
				this.delay.delayTime.value = slider.value;
			case 'feedback':
				this.feedback.gain.value = slider.value;
			case 'scuzzVolume':
				this.scuzzGain.gain.value = slider.value;
			default:
				console.log(`Slider name ${slider} not found`);
		}
	}

	SetWaveform(value) {
		var waves = ["sine", "square", "sawtooth", "triangle"];
		this.oscillator.type = waves[value];
	}

	SetFilterFrequency(y: number) {
		this.filter.frequency.value = (this.context.sampleRate / 2) * (y / 100);
	}

	//private _convertPositionToPitch(pos: ICoordinates) {
	//	return pos.x * this._pitchMultiplier;
	//}


	animateSpectrum() {
		this.mySpectrum = requestAnimationFrame(this.animateSpectrum.bind(this));
		this.drawSpectrum();
	}

	drawSpectrum() {
		//TODO: the size is not drawing correctly - start again from scratch
		var canvas: any = document.querySelector('canvas'),
			ctx = canvas.getContext('2d'),
			canvasSize = canvas.width + 30,
			width = canvasSize,
			height = canvasSize,
			freqByteData,
			barCount,
			magnitude,
			i;

		canvas.width = canvasSize - 20;
		canvas.height = canvasSize - 10;

		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = STYLE_CONST.BLACK;

		freqByteData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
		this.audioAnalyser.getByteFrequencyData(freqByteData);
		barCount = Math.round(width / style.barWidth);

		for (i = 0; i < barCount; i += 1) {
			magnitude = freqByteData[i];
			// some values need adjusting to fit on the canvas
			ctx.fillRect(style.barWidth * i * 1.6, height, style.barWidth, -magnitude);
		}
	}

}

export default Audio;
