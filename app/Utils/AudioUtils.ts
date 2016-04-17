/**
 * IOS needs to start audio on first touchUp in order for web audio to run
 */
let isUnlocked = false;
export function startIOSAudio(context: AudioContext, cb): void {

	if (isUnlocked) return;
	// create empty buffer and play it
	const source: any = context.createBufferSource();
	source.buffer = context.createBuffer(1, 1, 48000);;
	source.connect(context.destination);
	source.start(0);
	
	// by checking the play state after some time, we know if we're really unlocked
	setTimeout(function() {
		if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
			isUnlocked = true;
			cb();
		}
	}, 0);
}


/**
 * Joins to buffers together. If one buffer is empty, return the other.
 * @param oldBuffer {AudioBuffer}
 * @param newBuffer {AudioBuffer}
 * @returns {AudioBuffer}
 */
export function appendBuffer(oldBuffer: AudioBuffer, newBuffer: AudioBuffer = oldBuffer, audioContext: AudioContext): AudioBuffer {
	if (!oldBuffer && newBuffer){
		return newBuffer;
	} else if (!newBuffer && oldBuffer) {
		return oldBuffer;
	}
	const numOfChannels = Math.min(oldBuffer.numberOfChannels, newBuffer.numberOfChannels);
	const joinedLength = (oldBuffer.length + newBuffer.length);
	const joinedBuffer = audioContext.createBuffer(numOfChannels, joinedLength, oldBuffer.sampleRate);
	for (var i = 0; i < numOfChannels; i++) {
		var channel = joinedBuffer.getChannelData(i);
		channel.set(oldBuffer.getChannelData(i), 0);
		channel.set(newBuffer.getChannelData(i), oldBuffer.length);
	}
	return joinedBuffer;
};


/**
 * Decrease the amplification a buffer by multiplying buffer data by volume number less than 1.
 * @param buffer
 * @param volume -
 * @param audioContext
 * @returns {AudioBuffer}
 */
export function weakenBuffer(buffer: AudioBuffer, volume: number, audioContext: AudioContext){
	volume = Math.min(1, volume);
	const newBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
	for (let channel = 0, c = buffer.numberOfChannels; channel < c; channel++) {
		let oldData = buffer.getChannelData(channel);
		let newData = newBuffer.getChannelData(channel);
		for (var j = 0; j < oldData.length; j++) {
			newData[j] = oldData[j] * volume;
		}
	}
	return newBuffer;
}