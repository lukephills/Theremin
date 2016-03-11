const WorkerTimer = require("worker-timer");
const WebAudioScheduler = require('web-audio-scheduler');
const mergeBuffers = require('merge-audio-buffers');

interface IScheduledTrack {
	time: number;
	sound: AudioBufferSourceNode;
}

let __ID = 0; //TODO: could generate a loop id by using its position in Looper.loops


class Loop {
	id: number;
	//source: AudioBufferSourceNode;
	activeBufferSources: AudioBufferSourceNode[] = []
	buffer: AudioBuffer;
	output: GainNode;
	isPlaying: boolean;
	context: AudioContext;
	playCount: number = 0;
	maxPlayCount: number = 30;
	startOffset: number = 0; //TODO: if start overdubbing whilst playing back give the loop an offset of loop[0].length - newloopLength
	disposed: boolean = false;

	constructor(context) {
		this.isPlaying = false;
		this.context = context;
		this.output = this.context.createGain();
		//this.source.connect(this.output);
		this.buffer = null;
		this.id = __ID;
		__ID++;
	}

	play(time: number = this.context.currentTime){
		if (!this.disposed){
			//console.log('start loop', this.id, 'at time',this.context.currentTime,'. Currently playing?', this.isPlaying)
			// Audiobuffer sources get created and deleted each time
			let source: AudioBufferSourceNode = this.context.createBufferSource();
			source.buffer = this.buffer;
			source.start(this.context.currentTime, this.startOffset);
			source.connect(this.output)
			//this.activeBufferSources.push(source);
			this.activeBufferSources[0] = source;
			this.isPlaying = true;
			this.playCount++;
		}
	}

	stop(time: number = this.context.currentTime) {
		if (this.disposed) return;
		//console.log('stop loop', this.id, 'at time: ', time);
		this.activeBufferSources.forEach((src: AudioBufferSourceNode) => {
			src.stop(time);
		})
		this.activeBufferSources = [];
		this.isPlaying = false;
	}
	//
	// Lower the volume of the loop over time and eventually remove it after maxLoopAmount amount
	updateVolume(){
		this.output.gain.value /= 1.1; //TODO: calculate this number based on this.maxPlayCount
		// if this output is barely audible remove loop
		if (this.playCount >= this.maxPlayCount){
			this.dispose();
		}
	}

	dispose() {
		this.stop();
		this.output.disconnect();
		this.activeBufferSources.forEach((src: AudioBufferSourceNode) => {
			src.disconnect();
		})
		this.activeBufferSources = [];
		this.output = null;
		this.buffer = null;
		this.isPlaying = null;
		this.disposed = true;
	}
}

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
	loops: Loop[] = []; //todo: refactor to array of loops?
	currentLoopId: number = null;
	maxLoopDuration: number = 300;
	scheduledTracks: IScheduledTrack[] = [];
	input: AudioNode;
	output: AudioNode;
	//minDuration: number = 0.7;
	loopLength: number = this.maxLoopDuration;
	nextLoopStartTime: number;
	timer: number;
	sched; //TODO: type this


	constructor(input: AudioNode, output: AudioNode, bufferSize: number = 4096) {

		this.input = input;
		this.output = output;
		this.bufferSize = bufferSize
		this.context = this.input.context;
		// recorder
		this.processor = this.context.createScriptProcessor(this.bufferSize, 2, 2);

		// connection
		this.input.connect(this.processor);
		this.processor.connect(this.output);


		this.sched = new WebAudioScheduler({
			timerAPI: WorkerTimer,
			context: this.context
		});

		this.playLoops = this.playLoops.bind(this);
		this.metronome = this.metronome.bind(this);
		this.onaudioprocess = this.onaudioprocess.bind(this);
		this.scheduler = this.scheduler.bind(this);

	}

	temp: number = 0;

	// scheduler is constantly called
	scheduler() {
		// next note soon
		while (this.nextLoopStartTime < this.context.currentTime - 0.1) {
			console.log('in the while loop', this.nextLoopStartTime, '<', this.context.currentTime)
			this.temp++;
			if (this.temp > 1){
				console.log('shit', this.nextLoopStartTime - this.context.currentTime)
			}
			//console.log(this.context.currentTime);
			// shedule play
			this.playLoops(this.loopLength);
			// next beat time
			this.nextLoopStartTime += this.loopLength;
		}
		// runner...
		this.timer = window.setTimeout(this.scheduler, 1);
	}

	metronome(e) {
		this.sched.insert(e.playbackTime, this.playLoops, { duration: this.loopLength });
		this.sched.insert(e.playbackTime + this.loopLength - 0.025, this.metronome);
	}

	playLoops(e) {
		//TODO: Test speed when only playing the most recent and setting all loop buffers.loop = true
		// This way we will only need to loop all if playing back the first time
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
		//this.nextLoopStartTime = this.context.currentTime;
		// run scheduler
		//this.sched.start(this.metronome);
		this.scheduler();

		this.isPlaying = true;
	}

	stopPlaying() {
		// stop playing
		this.isPlaying = false;
		//this.sched.stop(true);
		window.clearTimeout(this.timer);

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
		newLoop.buffer = this.appendBuffer(newLoop.buffer, e.inputBuffer);

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
		//this.nextLoopStartTime = null;
		//this.timer = null;
	}


	exportWav(callback){
		let buffers: AudioBuffer[] = [];
		for (let i in this.loops){
			buffers.push(this.loops[i].buffer);
		}
		let mergedBuffer = mergeBuffers(buffers, this.context);
		console.log('mergedBuffer', mergedBuffer);
		let dataView = new DataView(mergedBuffer);
		let blob = new Blob([dataView], { type: 'audio/wav' });
		console.log(blob)
	}

	/**
	 * Joins to buffers together. If one buffer is empty, return the other.
	 * @param b1 {AudioBuffer}
	 * @param b2 {AudioBuffer}
	 * @returns {AudioBuffer}
	 */
	private appendBuffer(b1, b2): AudioBuffer {
		if (b1 === null && b2 !== null){
			return b2;
		} else if (b2 === null && b1 !== null) {
			return b1;
		}
		var nc = Math.min(b1.numberOfChannels, b2.numberOfChannels);
		var b3 = (b1.length + b2.length);
		var tmp = this.context.createBuffer(nc, b3, b1.sampleRate);
		// For number of channels
		for (var i = 0; i < nc; i++) {
			var channel = tmp.getChannelData(i);
			channel.set(b1.getChannelData(i), 0);
			channel.set(b2.getChannelData(i), b1.length);
		}

		return tmp;
	};
}

export default Looper;

