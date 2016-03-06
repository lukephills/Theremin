interface IScheduledTrack {
	time: number;
	sound: AudioBufferSourceNode;
}

class Loop {
	_id: number = 0;

	get id() {
		return this._id++;
	}
}


class Looper {

	isRecording: boolean = false
	isPlaying: boolean = false;

	get isOverdubbing(): boolean {
		return this.recordings.length > 1 && this.isRecording;
	}

	get hasRecordings(): boolean {
		return this.recordings.length ? true : false;
	};

	bufferSize: number;
	context: AudioContext;
	processor: ScriptProcessorNode
	recordings: AudioBuffer[] = []; //todo: refactor to array of loops?
	loops: Loop[] = [];  //TODO:  array of loops
	currentLoopId: number = null;
	maxLoopDuration: number = 6;
	scheduledTracks: IScheduledTrack[] = [];
	input: AudioNode;
	output: AudioNode;
	minDuration: number = 0.7;
	loopLength: number = this.maxLoopDuration;
	nextLoopStartTime: number;
	timer: number;


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
	}

	// on audio process loop
	onaudioprocess(e) {
		// not recording -> exit
		if (!this.isRecording) {
			return;
		}

		// current recording
		let recording = this.recordings[this.currentLoopId];


		// update recording with new audio event information
		if (recording == null) {
			console.log('null?');
			recording = e.inputBuffer;
		} else {
			recording = this.appendBuffer(recording, e.inputBuffer);
		}

		//console.log(`updating recorded buffer ${recording}, duration ${recording.duration}`);

		// Save the updated recording
		this.recordings[this.currentLoopId] = recording;

		// record limit
		if (recording.duration > this.loopLength - 0.025) {
			this.nextLoopStartTime = this.context.currentTime;
			// move to next track and overdub
			this.incrementTrack();
		}
	};

	// schedule recording on first beat
	startRecording() {
		console.log(`startRecording`)
		// add a new track and set current loop
		this.incrementTrack();

		// start recording
		this.isRecording = true;

		// set audio process callback
		this.processor.onaudioprocess = this.onaudioprocess.bind(this);
	}

	startOverdubbing() {
		console.log(`startOverdubbing`);
		this.loopLength = this.recordings[0].duration;
		this.startPlaying();
	}

	stopRecording() {
		console.log('stop recording');
		//window.clearTimeout(this.timer);
		this.isRecording = false;

		this.processor.onaudioprocess = null;

		// current track
		//const track = this.getCurrentTrack();

		// track min duration
		//if (track && track.duration < this.minDuration) {
		//	// remove last track
		//	this.recordings.splice(-1, 1);
		//	this.currentTrack--;
		//}
	}

	//getCurrentTrack() {
	//	return this.recordings[this.currentTrack] || null;
	//}


	newTrack() {
		this.recordings.push(null);
	}

	incrementTrack() {
		console.log(`increment track`);
		console.log(this.recordings);
		this.setCurrentLoopId(this.recordings.length);
		this.newTrack();
	}

	//setCurrentId(id) {
	//	this.currentTrack = id;
	//}


	// start/stop playing
	startPlaying() {
		this.nextLoopStartTime = this.context.currentTime;
		// run scheduler
		this.scheduler();
		//// play loop as soon as possible
		//this.playLoop(this.nextBeatTime);

		// start playing
		this.isPlaying = true;


	}



	stopPlaying() {
		// stop playing
		this.isPlaying = false;

		// for each scheduled track
		for (var i in this.scheduledTracks) {
			// stop playing
			this.scheduledTracks[i].sound.stop();
		}

		// reset scheduled tracks
		this.scheduledTracks = [];


		// clear timer
		window.clearTimeout(this.timer);

		// reset
		//this.reset();
	}

	//TODO: schedule these. Call this function at the right time to play the loops
	// plays all recorded tracks in sync together as one loop
	playLoop(time: number) {
		// for each track

		for (var i in this.recordings) {
			// buffer
			var recording = this.recordings[i];
			// remove played tracks
			while (this.scheduledTracks.length && this.scheduledTracks[0].time < this.context.currentTime - 0.1) {
				this.scheduledTracks.splice(0, 1);
			}

			// track not null
			if (recording !== null) {
				const sound: AudioBufferSourceNode = this.context.createBufferSource();
				sound.buffer = recording;
				sound.connect(this.output);
				sound.start(time);

				this.scheduledTracks.push({
					time: time,
					sound: sound
				});
			}
		}

		console.log('scheduled tracks', this.scheduledTracks);
	}

	// WHEN RECORD/PLAY IS PRESSED //action
	onRecordPress() {
		console.log(`onRecordPress`);
		// if already recording,

		if (this.isOverdubbing) {
			this.stopRecording();
			this.stopPlaying();
		}

		else if (this.isRecording && !this.isOverdubbing) {
			// start overdubbing
			this.startOverdubbing();
		}
		// not recording/ overdubbing, start recording
		else {
			this.startRecording();
		}
	}

	// play/stop button
	onPlaybackPress() {
		// if playing, stop playing
		if (this.isPlaying) {
			this.stopPlaying();
		}

		// if we're recording and we click play/stop, stop recording
		else if (this.isRecording && this.hasRecordings) {
			this.stopRecording();
			this.startPlaying();
		}

		// if we're not playing and not recording but there are recordings *to* play start playing them
		else if (this.hasRecordings) {
			this.startPlaying();
		}
	}


	// LOOPS
	addLoop(loop) {
		this.loops.push(loop);
		return loop;
	}

	getLoop(id): Loop | boolean {
		for (var i in this.loops) {
			if (this.loops[i].id == id) {
				return this.loops[i];
			}
		}
		return false;
	}

	getCurrentLoop(): Loop | boolean {
		return this.getLoop(this.currentLoopId);
	}

	setCurrentLoopId(id: number) {
		this.currentLoopId = id;
	}



	getLoopPosition(loop) {
		// for each filters
		for (var id in this.loops) {
			// this is the target -> return
			if (this.loops[id].id == loop.id) {
				return parseInt(id);
			}
		}

		// not found
		return null;
	}

	removeLoop(loop) {
		// stop playing/recording loop
		loop.stop();

		// get filter position
		var loopPosition = this.getLoopPosition(loop);

		// remove loop from array
		this.loops.splice(loopPosition, 1);
	}

	// Schedules all the loops to play ath the next beat time
	//schedulePlay() {
	//	console.log(`schedule the loops ${this.loops} to start at ${this.nextBeatTime}`);
	//	// for each loop
	//	this.loops.forEach((loop) => {
	//		// is playing and one beat or is first beat
	//		if (loop.isPlaying() && (loop.beats == 1 || this.beatsCount % loop.beats == 1)) {
	//			loop.play(this.nextBeatTime);
	//		}
	//	});
	//}

	// scheduler is constantly called
	scheduler() {
		//console.log('scheduler')
		// next note soon
		while (this.nextLoopStartTime < this.context.currentTime) {

			console.log('in loop at ', this.context.currentTime, 'the next loop start time was: ', this.nextLoopStartTime);

			// shedule play
			this.playLoop(this.loopLength);
			//
			//// push note in queue
			//this.beatsQueue.push({
			//	time: this.nextBeatTime,
			//	num: this.beatsCount
			//});
			//
			//
			// next beat time
			this.nextLoopStartTime += this.loopLength;
		}

		// runner...
		this.timer = setTimeout(() => {
			this.scheduler();
		}, 25);
	}


	//reset() {
	//	this.running = false;
	//	this.firstBeat = false;
	//	this.timer = null;
	//	this.nextBeatTime = null;
	//	this.beatsQueue = [];
	//	this.beatsCount = 0;
	//}

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

