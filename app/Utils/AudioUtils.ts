/**
 * IOS needs to start audio on first touchUp in order for web audio to run
 */
export function startIOSAudio(context: AudioContext): void {
	console.log('start ios');
	const buffer: AudioBuffer = context.createBuffer(1, 1, 22050);
	const source: AudioBufferSourceNode = context.createBufferSource();
	source.buffer = buffer;	source.connect(context.destination);
	source.start(0);
}


