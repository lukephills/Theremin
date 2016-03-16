const WorkerTimer = require("worker-timer");
const mergeBuffers = require('merge-audio-buffers');
const bufferUtils = require('audio-buffer-utils');
import RecorderWorker from './RecorderWorker';
import Loop from './Loop';
import {appendBuffer, weakenBuffer} from '../AudioUtils';


class Looper {

	isRecording: boolean = false
	isPlaying: boolean = false;

	get isOverdubbing(): boolean {
		return this.loops.length > 1 && this.isRecording;
	}

	get hasRecordings(): boolean {
		return this.loops.length ? true : false;
	};

	bufferSize: number;
	context: AudioContext;
	processor: ScriptProcessorNode
	loops: Loop[] = []; //TODO: loops should have a max of amount value
	maxAmountOfLoops: number = 3;
	currentLoopId: number = null;
	maxLoopDuration: number = 300;
	input: AudioNode;
	output: AudioNode;
	loopLength: number = this.maxLoopDuration;
	nextLoopStartTime: number = null;
	timer: number;
	recordMono: boolean = true;
	audioProcessLog: number = null;
	audioProcessLogDelay: number = null; //TODO: can we work this out using the bufferSize and sample rate?
	temploopLength: number = 0;
	isOverdubPressed: boolean = false;

	constructor(input: AudioNode, output: AudioNode, bufferSize: number = 4096) {

		this.input = input;
		this.output = output;
		this.bufferSize = bufferSize
		this.context = this.input.context;
		// recorder
		this.processor = this.context.createScriptProcessor(this.bufferSize, this.recordMono ? 1 : 2, 2);

		// connection
		this.input.connect(this.processor);
		this.processor.connect(this.output);


		this.playLoops = this.playLoops.bind(this);
		this.onaudioprocess = this.onaudioprocess.bind(this);
		this.scheduler = this.scheduler.bind(this);

		// initialize the Recorder worker for downloading/encoding WAV's only
		RecorderWorker.postMessage({
			command: 'init',
			config: {
				sampleRate: 44100,
				numChannels: this.recordMono ? 1 : 2
			}
		});
	}

	//temp: number = 0; //TODO: delete this when discovered the bug

	// scheduler is constantly called
	scheduler() {
		// Only play when the current time reaches the next LoopStartTime
		while (this.nextLoopStartTime < this.context.currentTime) {
			// shedule play
			this.playLoops();
			// next beat time
			this.nextLoopStartTime += this.loopLength;
			console.log('this.nextLoopStartTime = ', this.nextLoopStartTime);
		}
		// runner...
		this.timer = WorkerTimer.setTimeout(this.scheduler, 0);


		//this.timer = window.setTimeout(this.scheduler, 1);
	}

	playLoops() {
		//for (let i in this.loops){
		//	if (this.loops[i].buffer !== null){
		//		this.loops[i].play();
		//		if (this.isOverdubbing){
		//			this.loops[i].updateVolume();
		//			//TODO: once the loop has reached maxPlayCount remove it
		//			//if (this.loops[i].playCount >= this.loops[i].maxPlayCount){
		//			//	this.loops.shift();
		//			//	console.log('SHIFTED', this.loops);
		//			//}
		//		}
		//	}
		//}
		for (let i = this.loops.length - 1; i >= 0; i--){
			if (this.loops[i].buffer !== null && !this.loops[i].disposed){
				if (this.isOverdubbing){
					this.loops[i].updateVolume();
					//TODO: once the loop has reached maxPlayCount remove it
					//if (this.loops[i].playCount >= this.loops[i].maxPlayCount){
					//	this.loops.shift();
					//	console.log('SHIFTED', this.loops);
					//	continue;
					//}
				}
				this.loops[i].play();
			}
		}
	}

	stopLoops() {
		for (let i in this.loops) {
			if (this.loops[i].buffer !== null) {
				this.loops[i].stop();
			}
		}
	}

	// WHEN RECORD/PLAY IS PRESSED //action
	onRecordPress() {
		//TODO: instead of if else, make a switch statement to detect this.recordState
		//STOPPED STATE
		if (!this.isRecording && !this.isOverdubbing){
			if (this.isPlaying){
				this.stopPlaying();
			}
			this.reset();
			this.startRecording();
		}
		//FIRST RECORDING STATE
		else if (this.isRecording && !this.isOverdubbing){
			this.startOverdubbing();
		}
		//PLAYING BACK STATE
		else if (this.isPlaying && !this.isRecording) {
			//TODO
			//console.log('start recording whilst playing');
			//this.startRecording();
		}
		//OVERDUBBING STATE
		else if (this.isOverdubbing) {
			this.stopRecording();
			this.stopPlaying();
		}
	}

	// play/stop button
	onPlaybackPress() {
		// if playing, stop playing
		if (this.isPlaying && !this.isOverdubbing) {
			this.stopPlaying();
		}

		// if we're recording and we click play/stop, stop recording
		else if (this.isRecording && !this.isPlaying) {
			this.stopRecording();
			this.startPlaying();
		}

		else if (this.isRecording && this.isPlaying) {
			this.stopRecording();
		}
		//
		// if we're not playing and not recording but there are recordings *to* play start playing them
		else if (!this.isRecording && this.hasRecordings) {
			this.startPlaying();
		}
	}

	startRecording() {
		// add a new track and set current loop
		this.incrementLoop();
		this.isRecording = true;
		this.processor.onaudioprocess = this.onaudioprocess;
	}

	stopRecording() {
		this.setLoopLength(this.loops[0]);
		console.log(`stopped recording, we have ${this.loops.length} loops`, this.loops);
		this.isRecording = false;
		this.processor.onaudioprocess = null;
	}

	setLoopLength(loop: Loop){
		console.log('setLoopLength', loop.buffer.duration)
		this.loopLength = loop.buffer.duration;
	}

	startOverdubbing() {
		this.isOverdubPressed = true;
	}

	startPlaying() {
		console.time('scheduler');
		this.nextLoopStartTime = this.context.currentTime;
		// run scheduler
		this.scheduler();

		this.isPlaying = true;
	}

	stopPlaying() {
		// stop playing
		this.isPlaying = false;
		//window.clearTimeout(this.timer);
		WorkerTimer.clearTimeout(this.timer);

		this.stopLoops();
	}


	// on audio process loop
	//TODO: capture in mono to save processing power
	onaudioprocess(e) {
		//if (this.audioProcessLog && !this.audioProcessLogDelay) {
		//	this.audioProcessLogDelay = this.context.currentTime - this.audioProcessLog;
		//}
		//this.audioProcessLog = this.context.currentTime;
		////console.log('audioProcessLogDelay',this.audioProcessLogDelay)
		////console.log('audioProcessLog',this.audioProcessLog)





		// not recording -> exit
		if (!this.isRecording && !this.isOverdubbing) {
			return;
		}
		// current loop
		let newLoop = this.loops[this.currentLoopId];

		// update recording with new audio event information
		newLoop.buffer = appendBuffer(newLoop.buffer, e.inputBuffer, this.context);

		// Save the updated loop
		this.loops[this.currentLoopId] = newLoop;

		//check if the overdub button was first pressed
		if (this.isOverdubPressed){
			this.setLoopLength(this.loops[0]);
			this.startPlaying();
		}

		// start a new loop & connect old loop to output if the loop length reaches the maximum loopLength (minus buffer time)
		if (newLoop.buffer.duration >= this.loopLength) {
			//reset overdub pressed button
			this.isOverdubPressed = false;

			this.temploopLength = 0;
			//this.connectLoopToOutput(this.loops[this.currentLoopId]);
			this.nextLoopStartTime = this.context.currentTime;
			this.incrementLoop();
			console.log('first buffer duration', this.loops[0].buffer.duration)
			//console.clear();
			console.log('out by', this.temploopLength + this.loopLength - this.loops[0].buffer.duration)

			//console.log(`new recorded buffer added, duration ${newLoop.buffer.duration}`, this.loops);
		}
	};

	connectLoopToOutput(loop: Loop){
		loop.output.connect(this.output);
	}

	newLoop() {
		this.loops.push(new Loop(this.context));
		this.connectLoopToOutput(this.loops[this.currentLoopId]);
	}

	incrementLoop() {
		//if (this.loops.length === this.maxAmountOfLoops) return;
		console.log(`${this.loops.length} loops recorded`);
		console.log('set current loop id',this.loops.length);
		this.setCurrentLoopId(this.loops.length);
		this.newLoop();
	}

	setCurrentLoopId(id: number) {
		this.currentLoopId = id;
	}

	reset() {
		this.loops = [];
		this.loopLength = this.maxLoopDuration;
		this.timer = null;
		this.nextLoopStartTime = null;
	}



	exportWav(returnWavCallback: Function){
		let buffers: AudioBuffer[] = [];

		let weakenAmount = Math.min(this.loops.length, 4);

		for (let i in this.loops){
			if (this.loops[i].buffer !== null){
				const newBuffer = weakenBuffer(this.loops[i].buffer, this.loops[i].output.gain.value / weakenAmount, this.context)
				buffers.push(newBuffer);
			}
		}

		const mergedBuffer: AudioBuffer = mergeBuffers(buffers, this.context);
		const normalizedBuffer = bufferUtils.normalize(mergedBuffer);

		RecorderWorker.postMessage({
			command: 'clear',
		});

		// callback for `exportWAV`
		RecorderWorker.onmessage = function(e) {
			// this is would be your WAV blob
			returnWavCallback(e.data.data);
		};

		// send the channel data from our buffer to the worker
		// TODO: update this to allow stereo recording in the future
		RecorderWorker.postMessage({
			command: 'record',
			buffer: [
				normalizedBuffer.getChannelData(0)
			]
		});

		// ask the worker for a WAV
		RecorderWorker.postMessage({
			command: 'exportWAV',
			type: 'audio/wav'
		});
	}
}

export default Looper;
