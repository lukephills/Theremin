//import {ICoordinates} from './Components/MultiTouchView';
import { DEFAULTS } from './Constants/Defaults';
import Recorder from './Utils/Recorder/recorder';
import * as CanvasUtils from './Utils/CanvasUtils';
import {WaveformStringType} from './Constants/AppTypings';
const Tone: any = require('Tone/core/Tone.js');

import Looper from './Utils/Recorder/Looper'

interface IAnalysers {
	live: AnalyserNode;
	recording: AnalyserNode;
}

class Audio {

	public tone: Tone = new Tone();
	public context: AudioContext = this.tone.context;
	public voiceCount: number = DEFAULTS.VoiceCount;
	public recorder: Recorder;
	public recording: AudioBufferSourceNode;
	public looper: Looper;


	// Gains
	public masterVolume: GainNode = this.context.createGain();
	public thereminOutput: GainNode = this.context.createGain();
	public oscillatorGains: GainNode[] = [];
	public scuzzGain: GainNode = this.context.createGain();
	public recordingGain: GainNode = this.context.createGain();

	// Effects
	public compressor: DynamicsCompressorNode = this.context.createDynamicsCompressor();
	public delay: DelayNode = this.context.createDelay();
	public feedback: GainNode = this.context.createGain();
	public filters: BiquadFilterNode[] = [];

	// Analysers
	public analysers: IAnalysers = {
		live: this.context.createAnalyser(),
		recording: this.context.createAnalyser(),
	}

	// Oscillators
	public oscillators: OscillatorNode[] = [];
	public scuzz: OscillatorNode = this.context.createOscillator();

	private _frequencyMultiplier: number = 15;
	private _defaultCoordinates: CanvasUtils.ICoordinates = {x: 0, y: 0};

	constructor() {
		// AUDIO NODE SETUP
		for (let i: number = 0; i < this.voiceCount; i++) {
			this.oscillators.push(this.context.createOscillator());
			this.filters.push(this.context.createBiquadFilter());
			this.oscillatorGains.push(this.context.createGain());
		}

		this.routeSounds();
		this.setupAnalysers();
		//this.recorder = new Recorder(this.thereminOutput);
		this.looper = new Looper(this.thereminOutput, this.recordingGain)
	}

	public Start(pos: CanvasUtils.ICoordinates = this._defaultCoordinates, index: number = 0): void {
		if (index < this.voiceCount) {
			this.SetFilterFrequency(pos.y, index);
			this.oscillatorGains[index].gain.value = 1;
			this.oscillators[index].frequency.value = pos.x * this._frequencyMultiplier;
		}
	}

	public Stop(pos: CanvasUtils.ICoordinates = this._defaultCoordinates, index: number = 0): void {
		if (index < this.voiceCount) {
			this.oscillators[index].frequency.value = pos.x * this._frequencyMultiplier;
			this.oscillatorGains[index].gain.value = 0;
		}
	}

	public StopAll(): void {
		for (let i: number = 0; i < this.voiceCount; i++) {
			this.Stop(this._defaultCoordinates, i);
		}
	}

	public Move(pos: CanvasUtils.ICoordinates = this._defaultCoordinates, index: number = 0): void {
		if (index < this.voiceCount) {
			this.oscillators[index].frequency.value = pos.x * this._frequencyMultiplier;
			this.SetFilterFrequency(pos.y, index);
		}
	}

	public SetWaveform(value: WaveformStringType): void {
		this.oscillators.forEach((osc: OscillatorNode) => {
			osc.type = value;
		});
	}

	public SetFilterFrequency(y: number, id: number): void {
		if (id < this.voiceCount) {
			this.filters[id].frequency.value = (this.tone.context.sampleRate / 2) * (y / 100);
		}
	}

	onRecordPress() {
		this.looper.onRecordPress();
	}

	//public StartRecorder(): void {
	//	this.recorder.clear();
	//	this.recorder.record();
	//}
	//
	//public StopRecorder(): void {
	//	this.recorder.stop();
	//}

	onPlaybackPress() {
		this.looper.onPlaybackPress();
	}

	public StartPlayback(): void {
		this.recorder.getBuffer((buffers: Float32Array[]) => {
			this.recording = this.tone.context.createBufferSource();
			const newBuffer: AudioBuffer = this.tone.context.createBuffer( 2, buffers[0].length, this.tone.context.sampleRate );
			newBuffer.getChannelData(0).set(buffers[0]);
			newBuffer.getChannelData(1).set(buffers[1]);
			this.recording.buffer = newBuffer;
			this.recording.connect(this.recordingGain);
			this.recording.loop = true;
			this.recording.start(0);
		});
	}

	public StopPlayback(): void {
		this.recording.stop(0);
	}

	public Download(cb: Function): void {
		this.recorder.exportWAV((recording: Blob) => {
			cb(recording);
		});
	}

	private setupAnalysers(): void {
		if (this.analysers) {
			for (const analyser in this.analysers) {
				this.analysers[analyser].maxDecibels = DEFAULTS.Analyser.maxDecibels;
				this.analysers[analyser].minDecibels = DEFAULTS.Analyser.minDecibels;
				this.analysers[analyser].smoothingTimeConstant = DEFAULTS.Analyser.smoothingTimeConstant;
			}
		}
	}

	private routeSounds(): void {
		this.oscillators.forEach((oscillator: OscillatorNode) => {
			oscillator.type = 'square';
		});
		this.filters.forEach((filter: BiquadFilterNode) => {
			filter.type = 'lowpass';
		});

		// Set slider values
		this.delay.delayTime.value = DEFAULTS.Sliders.delay.value;
		this.feedback.gain.value = DEFAULTS.Sliders.feedback.value;
		this.scuzzGain.gain.value = DEFAULTS.Sliders.scuzz.value;

		this.oscillatorGains.forEach((oscGain: GainNode) => {
			oscGain.gain.value = 0;
		});
		this.masterVolume.gain.value = 0.5;

		this.scuzz.frequency.value = 400;
		this.scuzz.type = DEFAULTS.Sliders.scuzz.waveform;

		// Connect the Scuzz
		this.scuzz.connect(this.scuzzGain);

		for (let i: number = 0; i < this.voiceCount; i++) {
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
		this.thereminOutput.connect(this.analysers.live);
		this.analysers.live.connect(this.masterVolume);

		this.recordingGain.connect(this.analysers.recording);
		this.analysers.recording.connect(this.masterVolume);

		//OUTPUT
		this.masterVolume.connect(this.context.destination);

		//Start oscillators
		this.scuzz.start(0);
		this.oscillators.forEach((osc: OscillatorNode) => {
			osc.start(0);
		});
	}

}
export default new Audio();
