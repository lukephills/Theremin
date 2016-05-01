class Loop {

	public activeBufferSource: AudioBufferSourceNode = null;
	public buffer: AudioBuffer = null;
	public id: number;
	public output: GainNode;
	public overdubCount: number;
	public startOffset: number;

	private context: AudioContext;

	constructor(context: AudioContext) {
		this.context = context;

		/**
		 * If we start overdub from playing back state the loop will have a startOffset value so we can schedule
		 * it's playback in the right position
		 * @type {number} Defaults to 0 (the start of the loopLength
		 */
		this.startOffset = 0;

		/**
		 * Every time the loop is played whilst overdubbing this will be incremented.
		 * @type {number}
		 */
		this.overdubCount = 0;

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
	public play(time: number = this.context.currentTime): void {
		time = time + this.startOffset;
		// Create a temporary BufferSourceNode for this loop and play
		let source: AudioBufferSourceNode = this.context.createBufferSource();
		source.buffer = this.buffer;
		source.connect(this.output);
		source.start(time);

		// Save the buffer source so we can stop if we need to
		this.activeBufferSource = source;
	}

	/**
	 * Stop the loop
	 */
	public stop(): void {
		if (this.activeBufferSource) {
			this.activeBufferSource.stop(this.context.currentTime);
			this.activeBufferSource = null;
		}
	}

	/**
	 * Lower the volume of the loop over time and eventually remove it after maxLoopAmount amount
	 */
	public lowerVolume(volumeReduceAmount: number = 1): void {
		this.output.gain.value /= volumeReduceAmount;
	}
}
export default Loop;
