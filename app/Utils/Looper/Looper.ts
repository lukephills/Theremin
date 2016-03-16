const WorkerTimer = require("worker-timer");
const mergeBuffers = require('merge-audio-buffers');
const bufferUtils = require('audio-buffer-utils');
import RecorderWorker from './RecorderWorker';
import Loop from './Loop';
import {appendBuffer, weakenBuffer} from '../AudioUtils';


class Looper {

	public bufferSize: number;
	public isPlaying: boolean = false;
	public isRecording: boolean = false
	public loops: Loop[] = [];
	public maxAmountOfLoops: number = 3; //TODO: support a max amount of loops
	public maxLoopDuration: number = 300;
	public recordMono: boolean = true;

	private context: AudioContext;
	private currentLoopId: number = null;
	private input: AudioNode;
	private isOverdubPressed: boolean = false;
	private loopLength: number = this.maxLoopDuration;
	private nextLoopStartTime: number = null;
	private output: AudioNode;
	private playbackSchedulerTimeout: number;
	private processor: ScriptProcessorNode;

	public get isOverdubbing(): boolean {
		return this.loops.length > 1 && this.isRecording;
	}

	public get hasRecordings(): boolean {
		return this.loops.length ? true : false;
	};

	/**
	 * LOOPER
	 * Record, overdub and playback loops in the same style as a Line 6 DL4 Green Delay
	 * `const looper = new Looper(input, output, bufferSize? = 4096)`
	 * @param input {AudioNode}
	 * @param output {AudioNode}
	 * @param bufferSize (number}
	 */
	constructor(input: AudioNode, output: AudioNode, bufferSize: number = 4096) {
		// Audio input
		this.input = input;

		// Audio output
		this.output = output;

		//
		this.bufferSize = bufferSize
		this.context = this.input.context;

		// recorder
		this.processor = this.context.createScriptProcessor(this.bufferSize, this.recordMono ? 1 : 2, 2);

		// connection
		this.input.connect(this.processor);
		this.processor.connect(this.output);

		// bind this to callback functions
		this.onaudioprocess = this.onaudioprocess.bind(this);
		this.playbackScheduler = this.playbackScheduler.bind(this);

		// initialize the Recorder worker for downloading/encoding WAV's only
		RecorderWorker.postMessage({
			command: 'init',
			config: {
				sampleRate: 44100,
				numChannels: this.recordMono ? 1 : 2
			}
		});
	}

	/**
	 * Recursive function to schedule loops to play at each loop start time
	 */
	playbackScheduler() {
		// Only play when the current time reaches the next LoopStartTime
		while (this.nextLoopStartTime < this.context.currentTime) {
			this.playLoops();
			// set the next loop start time
			this.nextLoopStartTime += this.loopLength;
		}
		// Keep scheduler running
		this.playbackSchedulerTimeout = WorkerTimer.setTimeout(this.playbackScheduler, 0);
	}

	/**
	 * Play all the loops starting with the newest
	 */
	playLoops() {
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

	/**
	 * Stop all loops immediately
	 */
	stopLoops() {
		for (let i in this.loops) {
			if (this.loops[i].buffer !== null) {
				this.loops[i].stop();
			}
		}
	}

	/**
	 * When the record/overdub button is pressed
	 */
	onRecordPress() {
		//TODO: instead of if else, make a switch statement to detect this.recordState
		// STOPPED STATE
		if (!this.isRecording && !this.isOverdubbing){
			if (this.isPlaying){
				this.stopPlaying();
			}
			this.reset();
			this.startRecording();
		}
		// FIRST RECORDING STATE
		else if (this.isRecording && !this.isOverdubbing){
			this.startOverdubbing();
		}
		// PLAYING BACK STATE
		else if (this.isPlaying && !this.isRecording) {
			//TODO: add ability to carry on overdubbing
			//console.log('start recording whilst playing');
			//this.startRecording();
		}
		// OVERDUBBING STATE
		else if (this.isOverdubbing) {
			this.stopRecording();
			this.stopPlaying();
		}
	}

	/**
	 * When the playback/stop button is pressed
	 */
	onPlaybackPress() {
		// if playing, stop playing
		if (this.isPlaying && !this.isOverdubbing) {
			this.stopPlaying();
		}

		// if recording, stop recording
		else if (this.isRecording && !this.isPlaying) {
			this.stopRecording();
			this.startPlaying();
		}

		// if overdubbing, stop overdubbing but carry on playing
		else if (this.isRecording && this.isPlaying) {
			this.stopRecording();
		}

		// if not playing or recording/overdubbing but loops exist, play them
		else if (!this.isRecording && this.hasRecordings) {
			this.startPlaying();
		}
	}

	/**
	 * Start Recording
	 */
	startRecording() {
		// add a new empty loop  and set current loop
		this.incrementLoop();
		this.isRecording = true;
		this.processor.onaudioprocess = this.onaudioprocess;
	}

	/**
	 * Stop Recording
	 */
	stopRecording() {
		this.setLoopLength(this.loops[0]);
		this.isRecording = false;
		this.processor.onaudioprocess = null;
	}

	/**
	 * Set Looper.loopLength using the loop argument's buffer duration
	 * @param loop
	 */
	setLoopLength(loop: Loop){
		this.loopLength = loop.buffer.duration;
	}

	/**
	 * Start Overdubbing
	 */
	startOverdubbing() {
		// Set overdub pressed boolean for onaudioprocess to catch
		this.isOverdubPressed = true;
	}

	/**
	 * Start playback
	 */
	startPlaying() {
		// Set nextLoopStartTime as early as possible
		this.nextLoopStartTime = this.context.currentTime;
		// run scheduler
		this.playbackScheduler();
		this.isPlaying = true;
	}

	/**
	 * Stop playbacks
	 */
	stopPlaying() {
		this.isPlaying = false;
		WorkerTimer.clearTimeout(this.playbackSchedulerTimeout);
		this.stopLoops();
	}

	/**
	 * On audio process from the scriptProcessor
	 * @param e - contains audio buffer
	 */
	onaudioprocess(e) {
		// Exit loop if not recording
		if (!this.isRecording && !this.isOverdubbing) return;

		// get current loop
		let newLoop = this.loops[this.currentLoopId];

		// update loop with new audio
		newLoop.buffer = appendBuffer(newLoop.buffer, e.inputBuffer, this.context);

		// save the updated loop
		this.loops[this.currentLoopId] = newLoop;

		// if the overdub button was pressed set the loopLength and start playback
		if (this.isOverdubPressed){
			this.setLoopLength(this.loops[0]);
			this.startPlaying();
		}

		// if new loop reaches the max loop length
		if (newLoop.buffer.duration >= this.loopLength) {
			// reset overdub button
			this.isOverdubPressed = false;
			// start capturing a new loop
			this.incrementLoop();
		}
	};

	/**
	 * Create a new loop and add to list of loops
	 */
	newLoop() {
		this.loops.push(new Loop(this.context));
		this.loops[this.currentLoopId].output.connect(this.output);
	}

	/**
	 * Increment loop and set the current loop id
	 */
	incrementLoop() {
		console.log(`${this.loops.length} loops recorded`);
		this.currentLoopId = this.loops.length;
		this.newLoop();
	}

	/**
	 * Reset - Delete loops, stop scheduler and reset loopLength
	 */
	reset() {
		this.loops = [];
		this.loopLength = this.maxLoopDuration;
		this.playbackSchedulerTimeout = null;
		this.nextLoopStartTime = null;
	}

	/**
	 * Export Wav
	 * 1. Merges all loops together at their appropriate gains and normalizes to one audio buffer
	 * 2. Sends the buffer to the RecorderJs worker
	 * 3. Calls the callback function with the blob data as it's sole argument
	 * @param returnWavCallback {(Blob) => {}}
	 */
	exportWav(returnWavCallback: Function){
		let buffers: AudioBuffer[] = [];

		// Calculate an amount to futher reduce the loop's output gain. Amount of loops, but 4 max.
		const weakenAmount: number = Math.min(this.loops.length, 4);

		// Weaken all loops and add to buffers array
		for (let i in this.loops){
			if (this.loops[i].buffer !== null){
				const newBuffer = weakenBuffer(this.loops[i].buffer, this.loops[i].output.gain.value / weakenAmount, this.context)
				buffers.push(newBuffer);
			}
		}

		// Merge all buffers in buffers array
		const mergedBuffer: AudioBuffer = mergeBuffers(buffers, this.context);

		// Normalize the merged buffer
		const normalizedBuffer = bufferUtils.normalize(mergedBuffer);

		// Clear Recorder worker
		RecorderWorker.postMessage({
			command: 'clear',
		});

		// set exportWAV callback
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
