const WorkerTimer = require("worker-timer");
const mergeBuffers = require('merge-audio-buffers');
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
	loops: Loop[] = [];
	currentLoopId: number = null;
	maxLoopDuration: number = 300;
	input: AudioNode;
	output: AudioNode;
	loopLength: number = this.maxLoopDuration;
	nextLoopStartTime: number;
	timer: number;
	recordMono: boolean = true;


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

	temp: number = 0; //TODO: delete this when discovered the bug

	// scheduler is constantly called
	scheduler() {
		// next note soon
		while (this.nextLoopStartTime < this.context.currentTime - 0.1) {
			console.log('in the while loop', this.nextLoopStartTime, '<', this.context.currentTime)
			this.temp++;
			if (this.temp > 1){
				console.log('shit', this.nextLoopStartTime - this.context.currentTime)
			}
			// shedule play
			this.playLoops();
			// next beat time
			this.nextLoopStartTime += this.loopLength;
		}
		// runner...
		this.timer = WorkerTimer.setTimeout(this.scheduler, 1);
		//this.timer = window.setTimeout(this.scheduler, 1);
	}

	playLoops() {
		for (let i in this.loops){
			if (this.loops[i].buffer !== null){
				this.loops[i].play();
				if (this.isOverdubbing){
					this.loops[i].updateVolume();
				}
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
		this.setLoopLength(this.loops[0]);

		console.log(`startOverdubbing, the loop length is ${this.loopLength}`);
		this.startPlaying();
	}

	startPlaying() {
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

		// start a new loop & connect old loop to output if the loop length reaches the maximum loopLength (minus buffer time)
		if (newLoop.buffer.duration > this.loopLength) {
			this.temp = 0;
			//this.connectLoopToOutput(this.loops[this.currentLoopId]);
			this.nextLoopStartTime = this.context.currentTime;
			this.incrementLoop();
			console.log('first buffer duration', this.loops[0].buffer.duration)
			console.log(`new recorded buffer added, duration ${newLoop.buffer.duration}`, this.loops);
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
		console.log(`${this.loops.length} loops recorded`);
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
	}



	exportWav(returnWavCallback: Function){
		let buffers: AudioBuffer[] = [];
		for (let i in this.loops){
			const newBuffer = weakenBuffer(this.loops[i].buffer, this.loops[i].output.gain.value, this.context)
			buffers.push(newBuffer);
		}
		const mergedBuffer: AudioBuffer = mergeBuffers(buffers, this.context);

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
				mergedBuffer.getChannelData(0)
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
