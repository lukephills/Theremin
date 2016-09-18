const WorkerTimer: any = require('worker-timer'); //TODO: create type def
const mergeBuffers: any = require('merge-audio-buffers'); //TODO: create type def
const bufferUtils: any = require('audio-buffer-utils'); //TODO: create type def
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
	public isRecording: boolean = false;
	public loops: Loop[] = [];
	public maxAmountOfLoops: number = 30;
	public maxLoopDuration: number = 30; // seconds
	public recordMono: boolean = true;
	public volumeReduceAmount: number = 1.1;

	private context: AudioContext;
	private input: AudioNode;
	private isOverdubPressed: boolean = false;
	private tempLoopLength: number = this.maxLoopDuration+1;
	private loopLength: number = this.tempLoopLength;
	private nextLoopStartTime: number = null;
	private output: AudioNode;
	private playbackSchedulerTimeout: number;
	private processor: ScriptProcessorNode;
	private resumeOverdubbingpPressed: boolean = false;
	private _id: number = -1;

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
		this.bufferSize = bufferSize;
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
				numChannels: this.recordMono ? 1 : 2,
				sampleRate: 44100,
			},
		});
	}

	/**
	 * When the record/overdub button is pressed
	 */
	public onRecordPress(): void {
		//TODO: instead of if else, make a switch statement to detect this.recordState
		// STOPPED STATE
		if (!this.isRecording && !this.isOverdubbing && !this.isPlaying) {
			//if (this.isPlaying){
			//	this.stopPlaying();
			//}
			this.reset();
			this.startRecording();
		}
		// FIRST RECORDING STATE
		else if (this.isRecording && !this.isOverdubbing) {
			this.startOverdubbing();
		}
		// PLAYING BACK STATE
		else if (this.isPlaying && !this.isRecording) {
			this.resumeOverdubbing();
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
	public onPlaybackPress(): void {
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
	public startRecording(): void {
		// add a new empty loop  and set current loop
		this.newLoop();
		this.isRecording = true;
		this.processor.onaudioprocess = this.onaudioprocess;
	}

	/**
	 * Resume Recording
	 * Same as start recording except saves the start offset of the loop so it can play in the correct place
	 */
	public resumeOverdubbing(): void {
		this.resumeOverdubbingpPressed = true;
		// add a new empty loop  and set current loop
		this.newLoop();
		this.isRecording = true;
		this.processor.onaudioprocess = this.onaudioprocess;
	}

	/**
	 * Stop Recording
	 */
	public stopRecording(): void {
		this.setLoopLength(this.loops[0]);
		this.isRecording = false;
		this.processor.onaudioprocess = null;
	}

	/**
	 * Start Overdubbing
	 */
	public startOverdubbing(): void {
		// Set overdub pressed boolean for onaudioprocess to catch
		this.isOverdubPressed = true;
	}

	/**
	 * Start playback
	 */
	public startPlaying(): void {
		// Set nextLoopStartTime as early as possible
		this.nextLoopStartTime = this.context.currentTime;
		// run scheduler
		this.playbackScheduler();
		this.isPlaying = true;
	}

	/**
	 * Stop playbacks
	 */
	public stopPlaying(): void {
		this.isPlaying = false;
		WorkerTimer.clearTimeout(this.playbackSchedulerTimeout);
		this.stopLoops();
	}

	/**
	 * Export Wav
	 * 1. Merges all loops together at their appropriate gains, offsets and normalizes to one audio buffer
	 * 2. Sends the buffer to the RecorderJs worker
	 * 3. Calls the callback function with the blob data as it's sole argument
	 * @param returnWavCallback {(Blob) => {}}
	 */
	public exportWav(returnWavCallback: Function): void {
		let buffers: AudioBuffer[] = [];

		// Calculate an amount to futher reduce the loop's output gain. Amount of loops, but 4 max.
		const weakenAmount: number = Math.min(this.loops.length, 4);

		// Weaken all loops and add to buffers array
		for (let i in this.loops) {
			if (this.loops[i].buffer !== null) {
				let newBuffer: AudioBuffer = weakenBuffer(
					this.loops[i].buffer, this.loops[i].output.gain.value / weakenAmount, this.context);

				// Buffers with a start offset (ie. the first loop from a resumed overdub)
				// Shift their buffer data over by the offset amount
				if (this.loops[i].startOffset > 0) {
					let arrayOffset: number = Math.round(this.loops[i].startOffset * newBuffer.sampleRate);

					const shifted: AudioBuffer = this.context.createBuffer(
						newBuffer.numberOfChannels, Math.round(this.loopLength * newBuffer.sampleRate), newBuffer.sampleRate
					);

					if (newBuffer.length + arrayOffset  <= shifted.length) {
						newBuffer = bufferUtils.copy(newBuffer, shifted, arrayOffset);
					} else {
						console.error(
							'from.length + arrayOffset',
							newBuffer.length + arrayOffset, '>',
							'to.length',
							shifted.length,
							'by',
							((newBuffer.length + arrayOffset) - shifted.length) / newBuffer.sampleRate
						);
					}

				}
				// Add to list of buffers to merge
				buffers.push(newBuffer);
			}
		}

		
		WorkerTimer.setTimeout(() => {
			// Merge all buffers in buffers list
			const mergedBuffer: AudioBuffer = mergeBuffers(buffers, this.context);
			// Normalize the merged buffer
			const normalizedBuffer: AudioBuffer = bufferUtils.normalize(mergedBuffer);

			// Clear Recorder worker
			RecorderWorker.postMessage({
				command: 'clear'
			});

			// set exportWAV callback
			RecorderWorker.onmessage = function(e) {
				// this is would be your WAV blob
				returnWavCallback(e.data.data);
			};

			// send the channel data from our buffer to the worker
			// TODO: update this to allow stereo recording in the future
			RecorderWorker.postMessage({
				buffer: [
					normalizedBuffer.getChannelData(0)
				],
				command: 'record',
			});

			// ask the worker for a WAV
			RecorderWorker.postMessage({
				command: 'exportWAV',
				type: 'audio/wav',
			});
		}, 0);
	}

	/**
	 * Reset - Delete loops, stop scheduler and reset loopLength
	 */
	public reset(): void {
		this.loops = [];
		this.loopLength = this.tempLoopLength;
		this.playbackSchedulerTimeout = null;
		this.nextLoopStartTime = null;
		this._id = -1;
	}

	/**
	 * Set Looper.loopLength using the loop argument's buffer duration
	 * @param loop
	 */
	private setLoopLength(loop: Loop): void {
		this.loopLength = loop.buffer.duration + loop.startOffset;
	}

	/**
	 * Play all the loops starting with the newest
	 */
	private playLoops(): void {
		for (let i: number = this.loops.length - 1; i >= 0; i--) {
			if (this.loops[i].buffer !== null) {
				if (this.isOverdubbing) {
					// Lower the loops volume when overdubbing
					this.loops[i].lowerVolume(this.volumeReduceAmount);
					this.loops[i].overdubCount++;

					// Once the loop has reached maxPlayCount remove it
					if (this.loops[i].overdubCount === this.maxAmountOfLoops) {
						this.loops.shift();
						return;
					}

				}

				// We need to reset the startOffset of resumed overdub loops so that the buffer fits exactly into
				// this.loopLength. Otherwise there is a short audio dropout caused by timing inaccuracies.
				// TODO: this could be made more efficient
				if (this.loops[i].startOffset > 0) {
					this.loops[i].startOffset = this.loopLength - this.loops[i].buffer.duration;
				}
				this.loops[i].play();
			}
		}
	}

	/**
	 * Stop all loops immediately
	 */
	private stopLoops(): void {
		for (let i in this.loops) {
			if (this.loops[i].buffer !== null) {
				this.loops[i].stop();
			}
		}
	}

	/**
	 * Recursive function to schedule loops to play at each loop start time
	 */
	private playbackScheduler(): void {
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
	private onaudioprocess(e): void {
		// Exit loop if not recording
		if (!this.isRecording && !this.isOverdubbing) {
			return;
		}

		// get current loop
		let newLoop: Loop = this.loops[this.loops.length - 1];

		if (this.resumeOverdubbingpPressed) {
			newLoop.startOffset = this.loopLength - (this.nextLoopStartTime - this.context.currentTime);
			this.resumeOverdubbingpPressed = false;
		}

		// update loop with new audio
		newLoop.buffer = appendBuffer(newLoop.buffer, e.inputBuffer, this.context);

		// save the updated loop
		this.loops[this.loops.length - 1] = newLoop;

		// if the overdub button was pressed set the loopLength and start playback
		if (this.isOverdubPressed) {
			this.setLoopLength(this.loops[0]);
			this.startPlaying();
		}

		// if new loop reaches the max loop length //TODO: the startOffset at this point is not accurate
		if (newLoop.buffer.duration + newLoop.startOffset >= this.loopLength) {
			// reset overdub button
			this.isOverdubPressed = false;
			// start capturing a new loop
			this.newLoop();
		}
	};

	/**
	 * Create a new loop and add to list of loops
	 */
	private newLoop(): void {
		this._id++;
		this.loops.push(new Loop(this.context));
		const currentLoopIndex: number = this.loops.length - 1;
		this.loops[currentLoopIndex].output.connect(this.output);
		this.loops[currentLoopIndex].id = this._id;
	}
}

export default Looper;
