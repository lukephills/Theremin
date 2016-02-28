//import {ICoordinates} from './Components/MultiTouchView';
import { WAVEFORMS, Defaults } from './Constants/Defaults';
import Recorder from './Utils/Recorder/recorder';
import Visibility from './Utils/visibility';
import * as AudioUtils from './Utils/AudioUtils';
import * as CanvasUtils from './Utils/CanvasUtils';
const Tone = require("Tone/core/Tone.js");

class Audio {

	public tone: Tone = new Tone();
	public context: AudioContext = this.tone.context;
	public voiceCount: number = Defaults.VoiceCount;
	public recorder: Recorder;
	public recording: AudioBufferSourceNode;

	// Gains
	public masterVolume: GainNode = this.context.createGain();
	public thereminOutput: GainNode = this.context.createGain();
	public oscillatorGains: GainNode[] = []
	public scuzzGain: GainNode = this.context.createGain();
	public recordingGain: GainNode = this.context.createGain();

	// Effects
	public compressor: DynamicsCompressorNode = this.context.createDynamicsCompressor();
	public delay: DelayNode = this.context.createDelay();
	public feedback: GainNode = this.context.createGain();
	public filters: BiquadFilterNode[] = [];

	// Analysers
	public liveAnalyser: AnalyserNode = this.context.createAnalyser();
	public recordingAnalyser: AnalyserNode = this.context.createAnalyser();

	// Oscillators
	public oscillators: OscillatorNode[] = [];
	public scuzz: OscillatorNode = this.context.createOscillator();

	private _frequencyMultiplier: number = 15;
	private _defaultCoordinates: CanvasUtils.ICoordinates = {x: 0, y: 0};

	constructor() {
		// AUDIO NODE SETUP
		for (let i = 0; i < this.voiceCount; i++) {
			this.oscillators.push(this.context.createOscillator());
			this.filters.push(this.context.createBiquadFilter());
			this.oscillatorGains.push(this.context.createGain());
		}

		this._routeSounds();

		this.setupAnalysers();


		this.recorder = new Recorder(this.thereminOutput);

	}

	private setupAnalysers() {
		//TODO: refactor into loop
		this.liveAnalyser.maxDecibels = -25;
		this.liveAnalyser.minDecibels = -100;
		this.liveAnalyser.smoothingTimeConstant = 0.85;
		this.recordingAnalyser.maxDecibels = -25;
		this.recordingAnalyser.minDecibels = -100;
		this.recordingAnalyser.smoothingTimeConstant = 0.85;
	}

	private _routeSounds() {

		this.oscillators.forEach((oscillator: OscillatorNode) => {
			oscillator.type = 'square';
		});
		this.filters.forEach((filter: BiquadFilterNode) => {
			filter.type = 'lowpass';
		});

		// Set slider values
		this.delay.delayTime.value = Defaults.Sliders.delay.value;
		this.feedback.gain.value = Defaults.Sliders.feedback.value;
		this.scuzzGain.gain.value = Defaults.Sliders.scuzz.value;

		this.oscillatorGains.forEach((oscGain) => {
			oscGain.gain.value = 0;
		});
		this.masterVolume.gain.value = 0.5;


		this.scuzz.frequency.value = 400;
		this.scuzz.type = Defaults.Sliders.scuzz.waveform;

		// Connect the Scuzz
		this.scuzz.connect(this.scuzzGain);

		//TODO: CHECK THIS
		// Previously this:
		// this.scuzzVolume.connect(this.source.frequency);
		// But changed to this to fix older safari bug

		for (let i = 0; i < this.voiceCount; i++) {
			this.scuzzGain.connect(this.oscillators[i].detune as any);
			this.oscillators[i].connect(this.oscillatorGains[i]);
			this.oscillatorGains[i].connect(this.filters[i]);
			this.filters[i].connect(this.compressor);
			this.filters[i].connect(this.delay);
		}

		this.delay.connect(this.feedback);
		this.delay.connect(this.compressor);
		this.feedback.connect(this.delay);
		this.compressor.connect(this.thereminOutput);

		// THEREMIN ROUTE
		this.thereminOutput.connect(this.liveAnalyser);
		this.liveAnalyser.connect(this.masterVolume);

		// RECORDING ROUTE
		// NOTE: the filter here is because of the 'frozen byte data when stopping' bug in analyser
		// http://stackoverflow.com/questions/24355656/web-audio-analyser-frequency-data-not-0-during-silence
		var filter = this.context.createBiquadFilter();
		filter.type = "highpass";
		filter.frequency.value = 0.0001;
		filter.connect(this.recordingAnalyser);
		this.recordingGain.connect(filter);
		this.recordingAnalyser.connect(this.masterVolume)

		//OUTPUT
		this.masterVolume.connect(this.context.destination);

		//Start oscillators
		this.scuzz.start(0);
		this.oscillators.forEach((osc: OscillatorNode) => {
			osc.start(0);
		});
	}

	public Start(pos: CanvasUtils.ICoordinates = this._defaultCoordinates, index: number = 0): void{
		console.log(`start osc[${index}]`);
		if (index < this.voiceCount) {
			this.SetFilterFrequency(pos.y, index);
			this.oscillatorGains[index].gain.value = 1;
			this.oscillators[index].frequency.value = pos.x * this._frequencyMultiplier;
		}
	}
	public Stop(pos: CanvasUtils.ICoordinates = this._defaultCoordinates, index: number = 0): void {
		console.log(`stop osc[${index}]`);
		if (index < this.voiceCount) {
			this.oscillators[index].frequency.value = pos.x * this._frequencyMultiplier;
			this.oscillatorGains[index].gain.value = 0;
		}
	}

	public StopAll(): void {
		for (let i = 0; i < this.voiceCount; i++) {
			this.Stop(this._defaultCoordinates, i);
		}
		console.log('stopped all oscillators');
	}

	public Move(pos: CanvasUtils.ICoordinates = this._defaultCoordinates, index: number = 0): void {
		console.log(`move osc[${index}]`);
		if (index < this.voiceCount) {
			this.oscillators[index].frequency.value = pos.x * this._frequencyMultiplier;
			this.SetFilterFrequency(pos.y, index);
		}
	}

	public SetWaveform(value: string): void {
		this.oscillators.forEach((osc: OscillatorNode) => {
			osc.type = value;
		});
	}

	public SetFilterFrequency(y: number, id: number): void {
		if (id < this.voiceCount){
			this.filters[id].frequency.value = (this.tone.context.sampleRate / 2) * (y / 100);
		}
	}

	public StartRecorder(): void {
		console.log('recording...');
		this.recorder.clear();
		this.recorder.record();
	}

	public StopRecorder(): void {
		this.recorder.stop();
	}

	public StartPlayback(): void {
		this.recorder.getBuffer((buffers: Float32Array[]) => {
			this.recording = this.tone.context.createBufferSource();
			var newBuffer: AudioBuffer = this.tone.context.createBuffer( 2, buffers[0].length, this.tone.context.sampleRate );
			newBuffer.getChannelData(0).set(buffers[0]);
			newBuffer.getChannelData(1).set(buffers[1]);
			this.recording.buffer = newBuffer;
			this.recording.connect(this.recordingGain);
			this.recording.loop = true;
			this.recording.start(0);
		});
		console.log('playing back recording..')
	}

	public StopPlayback(): void {
		this.recording.stop(0);
		console.log('playback stopped.')
	}


	public Download(): void {
		console.log('downloading recording..');
		this.recorder.exportWAV((recording: Blob) => {
			console.log(recording);
			this.onExportWav(recording);
		});
	}

	onExportWav = (recording: Blob) => {};

}
export default new Audio();
