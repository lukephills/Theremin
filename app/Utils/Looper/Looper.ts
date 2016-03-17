const WorkerTimer = require("worker-timer");
const mergeBuffers = require('merge-audio-buffers');
const bufferUtils = require('audio-buffer-utils');
import RecorderWorker from './RecorderWorker';
import Loop from './Loop';
import {appendBuffer, weakenBuffer} from '../AudioUtils';

/**
 * LOOPER
 * Record, overdub and playback loops in the same style as a Line 6 DL4 Green Delay
 * Usage: `const looper = new Looper(input, output, bufferSize? = 4096)`
 * @param input {AudioNode}
 * @param output {AudioNode}
 * @param bufferSize (number}
 */
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
	 * When the record/overdub button is pressed
	 */
	public onRecordPress() {
		//TODO: instead of if else, make a switch statement to detect this.recordState
		// STOPPED STATE
		if (!this.isRecording && !this.isOverdubbing && !this.isPlaying){
			//if (this.isPlaying){
			//	this.stopPlaying();
			//}
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
			console.log('start recording whilst playing');
			//this.startRecording();
			this.resumeRecording();
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
	public onPlaybackPress() {
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
	public startRecording() {
		// add a new empty loop  and set current loop
		this.incrementLoop();
		this.isRecording = true;
		this.processor.onaudioprocess = this.onaudioprocess;
	}

	/**
	 * Resume Recording
	 * Same as start recording except saves the start offset of the loop so it can play in the correct place
	 */
	public resumeRecording() {
		let startOffset: number = this.loopLength - (this.nextLoopStartTime - this.context.currentTime);
		// add a new empty loop  and set current loop
		this.incrementLoop(startOffset);
		this.isRecording = true;
		this.processor.onaudioprocess = this.onaudioprocess;
	}

	/**
	 * Stop Recording
	 */
	public stopRecording() {
		this.setLoopLength(this.loops[0]);
		this.isRecording = false;
		this.processor.onaudioprocess = null;
	}

	/**
	 * Set Looper.loopLength using the loop argument's buffer duration
	 * @param loop
	 */
	private setLoopLength(loop: Loop){
		this.loopLength = loop.buffer.duration;
	}

	/**
	 * Start Overdubbing
	 */
	public startOverdubbing() {
		// Set overdub pressed boolean for onaudioprocess to catch
		this.isOverdubPressed = true;
	}

	/**
	 * Start playback
	 */
	public startPlaying() {
		// Set nextLoopStartTime as early as possible
		this.nextLoopStartTime = this.context.currentTime;
		// run scheduler
		this.playbackScheduler();
		this.isPlaying = true;
	}

	/**
	 * Export Wav
	 * 1. Merges all loops together at their appropriate gains, offsets and normalizes to one audio buffer
	 * 2. Sends the buffer to the RecorderJs worker
	 * 3. Calls the callback function with the blob data as it's sole argument
	 * @param returnWavCallback {(Blob) => {}}
	 */
	public exportWav(returnWavCallback: Function){
		let buffers: AudioBuffer[] = [];

		// Calculate an amount to futher reduce the loop's output gain. Amount of loops, but 4 max.
		const weakenAmount: number = Math.min(this.loops.length, 4);

		// Weaken all loops and add to buffers array
		for (let i in this.loops){
			if (this.loops[i].buffer !== null){
				let newBuffer: AudioBuffer = weakenBuffer(
					this.loops[i].buffer, this.loops[i].output.gain.value / weakenAmount, this.context)

				// Buffers with a start offset (ie. the first loop from a resumed overdub)
				// Shift their buffer data over by the offset amount
				if (this.loops[i].startOffset > 0) {
					console.log(Math.round(this.loopLength * newBuffer.sampleRate))
					console.log(Math.round(this.loops[i].startOffset * newBuffer.sampleRate))
					const shifted: AudioBuffer = this.context.createBuffer(
						newBuffer.numberOfChannels, this.loopLength * newBuffer.sampleRate, newBuffer.sampleRate
					);
					if (newBuffer.length === shifted.length + (this.loops[i].startOffset * newBuffer.sampleRate)){
						newBuffer = bufferUtils.copy(newBuffer, shifted, this.loops[i].startOffset * newBuffer.sampleRate);
					} else {
						console.error('shifted buffer at offset didnt fit');
						//TODO: Adjust offset so it WILL fit
					}

				}
				// Add to list of buffers to merge
				buffers.push(newBuffer);
			}
		}

		// Merge all buffers in buffers list
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

	/**
	 * Reset - Delete loops, stop scheduler and reset loopLength
	 */
	public reset() {
		this.loops = [];
		this.loopLength = this.maxLoopDuration;
		this.playbackSchedulerTimeout = null;
		this.nextLoopStartTime = null;
	}

	/**
	 * Play all the loops starting with the newest
	 */
	private playLoops() {
		for (let i = this.loops.length - 1; i >= 0; i--){
			if (this.loops[i].buffer !== null && !this.loops[i].disposed){
				if (this.isOverdubbing){
					this.loops[i].lowerVolume();
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
	 * Stop playbacks
	 */
	public stopPlaying() {
		this.isPlaying = false;
		WorkerTimer.clearTimeout(this.playbackSchedulerTimeout);
		this.stopLoops();
	}

	/**
	 * Stop all loops immediately
	 */
	private stopLoops() {
		for (let i in this.loops) {
			if (this.loops[i].buffer !== null) {
				this.loops[i].stop();
			}
		}
	}

	/**
	 * Recursive function to schedule loops to play at each loop start time
	 */
	private playbackScheduler() {
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
	 * On audio process from the scriptProcessor
	 * @param e - contains audio buffer
	 */
	private onaudioprocess(e) {
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
		if (newLoop.buffer.duration + newLoop.startOffset >= this.loopLength) {
			// reset overdub button
			this.isOverdubPressed = false;
			// start capturing a new loop
			this.incrementLoop();
		}
	};

	/**
	 * Create a new loop and add to list of loops
	 */
	private newLoop(startOffset = 0) {
		if (startOffset < 0) {
			console.error('start offset cant be below 0');
		}
		this.loops.push(new Loop(this.context, startOffset));
		this.loops[this.currentLoopId].output.connect(this.output);
		console.log('new loop created with offset = ', startOffset)
	}

	/**
	 * Increment loop and set the current loop id
	 */
	private incrementLoop(startOffset = 0) {
		this.currentLoopId = this.loops.length;
		this.newLoop(startOffset);
	}
}

export default Looper;
