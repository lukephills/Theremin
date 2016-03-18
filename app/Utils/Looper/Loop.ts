class Loop {
	activeBufferSource: AudioBufferSourceNode = null;
	buffer: AudioBuffer = null;
	output: GainNode;
	context: AudioContext;
	startOffset: number;
	disposed: boolean = false;
	playCount: number = 0;

	constructor(context: AudioContext) {
		this.context = context;

		/**
		 * If we start overdub from playing back state the loop will have a startOffset value so we can schedule
		 * it's playback in the right position
		 * @type {number} Defaults to 0 (the start of the loopLength
		 */
		this.startOffset = 0;

		/**
		 * Loops output gain
		 * @type {GainNode}
		 */
		this.output = this.context.createGain();
	}

	/**
	 * Play the loop at the time given plus it's startOffset
	 * @param time {number = currentTime)
	 */
	play(time: number = this.context.currentTime){
		// Create a temporary BufferSourceNode for this loop and play
		let source: AudioBufferSourceNode = this.context.createBufferSource();
		source.buffer = this.buffer;
		source.start(time + this.startOffset);
		source.connect(this.output)

		// Save the buffer source so we can stop if we need to
		this.activeBufferSource = source;
	}

	/**
	 * Stop the loop at the time
	 * @param time = currentTime
	 */
	stop(time: number = this.context.currentTime) {
		if (this.activeBufferSource){
			this.activeBufferSource.stop(time);
			this.activeBufferSource = null;
		}
	}

	/**
	 * Lower the volume of the loop over time and eventually remove it after maxLoopAmount amount
	 */
	lowerVolume(volumeReduceAmount: number = 1){ //TODO: should take a parameter (volumeReduceAmount) from Looper class
		this.output.gain.value /= volumeReduceAmount;
	}

	/**
	 * Dispose of the loop. TODO: this should be called from the Looper class when this loop is done.
	 */
	dispose() {
		this.stop();
		this.output.disconnect();
		this.activeBufferSource.disconnect();
		this.output = null;
		this.buffer = null;
		this.disposed = true;
	}
}
export default Loop;
