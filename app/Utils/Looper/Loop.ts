class Loop {
	activeBufferSources: AudioBufferSourceNode[] = []
	buffer: AudioBuffer = null;
	output: GainNode;
	isPlaying: boolean;
	context: AudioContext;
	playCount: number = 0;
	startOffset: number; //TODO: if start overdubbing whilst playing back give the loop an offset of loop[0].length - newloopLength
	disposed: boolean = false;
	volumeReduceAmount: number = 1.1; //TODO: calculate this number based on this.maxPlayCount

	constructor(context: AudioContext, startOffset: number = 0) {
		this.context = context;
		this.startOffset = startOffset;
		this.isPlaying = false;
		this.output = this.context.createGain();
	}

	play(time: number = this.context.currentTime){
		if (!this.disposed){
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
		this.output.gain.value /= this.volumeReduceAmount;
		// if this output is barely audible remove loop
		//if (this.playCount >= this.maxPlayCount){
		//	this.dispose();
		//}
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
export default Loop;
