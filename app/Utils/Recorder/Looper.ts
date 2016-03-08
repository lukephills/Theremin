const WorkerTimer = require("worker-timer");
const WebAudioScheduler = require('web-audio-scheduler');

interface IScheduledTrack {
	time: number;
	sound: AudioBufferSourceNode;
}

let __ID = 0;

class Loop {
	id: number;
	source: AudioBufferSourceNode;
	buffer: AudioBuffer;
	output: GainNode;
	isPlaying: boolean;
	context: AudioContext;
	playCount: number = 0;
	startOffset: number = 0;

	constructor(context) {
		this.isPlaying = false;
		this.context = context;
		this.source = this.context.createBufferSource();
		this.output = this.context.createGain();
		this.source.connect(this.output);
		this.buffer = null;
		this.id = __ID;
		__ID++;
	}

	play(time: number = this.context.currentTime){
		if (this.isPlaying){
			// If already playing, stop first then restart
			this.stop(time)
		}
		console.log('start loop', this.id)
		//this.source.start(time, this.startOffset);
		this.isPlaying = true;
		this.updateVolume();
		this.playCount++;
	}

	stop(time: number = this.context.currentTime) {
		console.log('stop loop', this.id);
		//this.source.stop(time);
		this.isPlaying = false;
	}
	//
	// Lower the volume of the loop over time and eventually remove it after maxLoopAmount amount
	updateVolume(){
		this.output.gain.value /= 1.1;
		// if this output is barely audible remove loop
	}

	dispose() {
		this.stop();
		this.output.disconnect();
		this.source.disconnect();
		this.output = null;
		this.source = null;
		this.buffer = null;
		this.isPlaying = null;
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
	maxLoopDuration: number = 6;
	scheduledTracks: IScheduledTrack[] = [];
	input: AudioNode;
	output: AudioNode;
	minDuration: number = 0.7;
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

	}

	metronome(e) {
		this.sched.insert(e.playbackTime + 0.000, this.playLoops, { duration: this.loopLength });
		this.sched.insert(e.playbackTime + this.loopLength, this.metronome);
	}

	playLoops(e) {
		const t0 = e.playbackTime;
		const t1 = t0 + e.args.duration;
		//
		for (let i in this.loops){
			if (this.loops[i].buffer !== null){
				this.loops[i].play();
			}
		}

		this.sched.nextTick(t1, () => {
			//for (let i in this.loops){
			//	this.loops[i].stop();
			//}
		});
	}

	// WHEN RECORD/PLAY IS PRESSED //action
	onRecordPress() {
		//TODO: instead of if else, make a switch statement to detect this.recordState
		//STOPPED STATE
		if (!this.isRecording && !this.isOverdubbing){
			this.reset();
			this.startRecording();
		}
		//FIRST RECORDING STATE
		else if (this.isRecording && !this.isOverdubbing){
			this.startOverdubbing();
		}
		//PLAYING BACK STATE
		else if (this.isPlaying && !this.isRecording) {
			console.log('start recording whilst playing');
			//this.startRecording();
		}
		//OVERDUBBING STATE
		else {
			this.stopRecording();
		}


		// if already recording,
		//if (this.isOverdubbing) {
		//	this.stopPlaying();
		//	this.stopRecording();
		//}
		//
		//else if (this.isRecording && !this.isOverdubbing) {
		//	// start overdubbing
		//	this.startOverdubbing();
		//}
		//
		//else if (this.isPlaying) {
		//	console.log('start recording whilst playing');
		//	this.startRecording();
		//}
		//// not recording / overdubbing / playing. Start new recording
		//else {
		//	this.reset();
		//	this.startRecording();
		//}
	}

	// play/stop button
	onPlaybackPress() {
		//// if playing, stop playing
		if (this.isPlaying) {
			this.stopPlaying();
		}
		//
		//// if we're recording and we click play/stop, stop recording
		//else if (this.isRecording && this.hasRecordings) {
		//	console.log('pressed play whilst recording/overdubbing');
		//	this.stopRecording();
		//	this.startPlaying();
		//}
		//
		//// if we're not playing and not recording but there are recordings *to* play start playing them
		//else if (this.hasRecordings) {
		//	this.startPlaying();
		//}
	}

	startRecording() {
		// add a new track and set current loop
		this.incrementLoop();
		this.isRecording = true;
		this.processor.onaudioprocess = this.onaudioprocess;
	}

	stopRecording() {
		console.log(`stopped recording, we have ${this.loops.length} loops`, this.loops);
		this.isRecording = false;
		this.processor.onaudioprocess = null;
	}

	startOverdubbing() {
		this.loopLength = this.loops[0].buffer.duration;
		console.log(`startOverdubbing, the loop length is ${this.loopLength}`);
		this.startPlaying();
	}


	startPlaying() {
		this.nextLoopStartTime = this.context.currentTime;
		// run scheduler
		this.sched.start(this.metronome);
		this.isPlaying = true;
	}

	stopPlaying() {
		// stop playing
		this.isPlaying = false;
		this.sched.stop(true);
		//this.stopLoop();
	}


	// on audio process loop
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
		if (newLoop.buffer.duration > this.loopLength - 0.025) {
			this.loops[this.currentLoopId].source.buffer = newLoop.buffer;
			this.loops[this.currentLoopId].output.connect(this.output);
			this.nextLoopStartTime = this.context.currentTime;
			this.incrementLoop();
			console.log(`new recorded buffer added, duration ${newLoop.buffer.duration}`, this.loops);
			//this.startOverdubbing();
		}
	};

	//TODO: schedule these. Call this function at the right time to play the loops
	// plays all recorded tracks in sync together as one loop
	playLoop(time: number) {
		// for each track
		console.log('scheduled tracks', this.scheduledTracks);
		for (var i in this.loops) {
			// buffer
			var loop = this.loops[i];
			// remove played tracks
			//while (this.scheduledTracks.length && this.scheduledTracks[0].time < this.context.currentTime - 0.1) {
			//	this.scheduledTracks.splice(0, 1);
			//}

			// track not null
			if (loop !== null) {
				loop.source.start(time);

				//this.scheduledTracks.push({
				//	time: time,
				//	sound: sound
				//});
			}
		}

		console.log('scheduled tracks', this.scheduledTracks);
		console.log('this recordings', this.loops);
	}

	stopLoop() {
		// clear timer
		console.log('stop loop');

		window.clearInterval(this.timer);

		// for each scheduled track
		for (var i in this.scheduledTracks) {
			// stop playing
			this.scheduledTracks[i].sound.stop();
		}

		// reset scheduled tracks
		this.scheduledTracks = [];


		console.log('scheduled tracks', this.scheduledTracks);
	}

	newLoop() {
		this.loops.push(new Loop(this.context));
	}

	incrementLoop() {
		console.log(`${this.loops.length} loops recorded`);
		this.setCurrentLoopId(this.loops.length);
		this.newLoop();
	}

	setCurrentLoopId(id: number) {
		this.currentLoopId = id;
	}

	// scheduler is constantly called
	scheduler() {
		// next note soon
		while (this.nextLoopStartTime < this.context.currentTime) {

			console.log('in loop at ', this.context.currentTime, 'the next loop start time was: ', this.nextLoopStartTime);

			// shedule play
			this.playLoop(this.loopLength);
			// next beat time
			this.nextLoopStartTime += this.loopLength;
		}

		// runner...
		this.timer = setInterval(() => {
			this.scheduler();
		}, 25);
	}


	reset() {
		this.loops = [];
		this.loopLength = this.maxLoopDuration;
		//this.nextLoopStartTime = null;
		//this.timer = null;
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

