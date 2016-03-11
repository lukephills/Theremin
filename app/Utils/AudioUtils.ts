/**
 * IOS needs to start audio on first touchUp in order for web audio to run
 */
export function startIOSAudio(context: AudioContext): void {
	const buffer: AudioBuffer = context.createBuffer(1, 1, 22050);
	const source: AudioBufferSourceNode = context.createBufferSource();
	source.buffer = buffer;	source.connect(context.destination);
	source.start(0);
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
