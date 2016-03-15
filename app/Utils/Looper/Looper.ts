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
	loops: Loop[] = []; //TODO: loops should have a max of amount value
	maxAmountOfLoops: number = 3;
	currentLoopId: number = null;
	maxLoopDuration: number = 300;
	input: AudioNode;
	output: AudioNode;
	loopLength: number = this.maxLoopDuration;
	nextLoopStartTime: number;
	timer: number;
	recordMono: boolean = true;
	audioProcessLog: number = null;
	audioProcessLogDelay: number = null; //TODO: can we work this out using the bufferSize and sample rate?
	temploopLength: number = 0;

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
		// next note soon
		while (this.nextLoopStartTime < this.context.currentTime - 0.1) {
			//console.log('in the while loop', this.nextLoopStartTime, '<', this.context.currentTime)
			//this.temp++;
			//if (this.temp > 1){
			//	console.log('shit', this.nextLoopStartTime - this.context.currentTime)
			//}
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
		this.setLoopLength(this.loops[0]); //TODO: at this point the loop length is too short, can we calculate what the length will be using the script processor buffer size. Set the length to the closest available buffer size. For example, at buffer size 4096 the onadudio process fires every 0.09287981859410444 seconds. At 2048 buffer size it fires every 0.04643990929705222 seconds. In the onaudioprocess function get currentTime twice to find difference between them. We can use this value to work out the time to stop recording.
		console.log(this.loops[0].buffer.duration)
		setTimeout => console.log(this.loops[0].buffer.duration), 500;
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
		//console.log('setLoopLength', this.temploopLength + this.loopLength - this.loops[0].buffer.duration)
		//this.loopLength = this.loops[0].buffer.duration;
		//this.loopLength = this.temploopLength + this.loopLength - this.loops[0].buffer.duration;


		console.log(`startOverdubbing, the loop length is ${this.loopLength}`);
		console.log(`startOverdubbing, the loop length is ${this.loopLength} + the amount time it takes until the next onaudioprocess gets called `);

		let now = this.context.currentTime;
		this.temploopLength = now + this.audioProcessLogDelay - this.audioProcessLog - 0.07;
		console.log(now, '+', this.audioProcessLogDelay, '-', this.audioProcessLog);
		console.log('now + this.audioProcessLogDelay - this.audioProcessLog - 0.07 = ', this.temploopLength);
		console.log(`startOverdubbing, the loop length is ${this.temploopLength + this.loopLength}`);
		// when was the last audioprocess called? - 200 ago => this.audioProcessLog
		// what is the time difference between audioprocesses - 1000 => this.audioProcessLogDelay
		// what time is it now - 3560
		// when will the next audio process be? - 3560 + (1000 - 200)
		// Set the new loop length to this.
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
		if (this.audioProcessLog && !this.audioProcessLogDelay) {
			this.audioProcessLogDelay = this.context.currentTime - this.audioProcessLog;
		}
		this.audioProcessLog = this.context.currentTime;
		//console.log('audioProcessLogDelay',this.audioProcessLogDelay)
		//console.log('audioProcessLog',this.audioProcessLog)

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
		if (newLoop.buffer.duration > this.loopLength + this.temploopLength) {
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
