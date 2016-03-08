export type WaveformStringType = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type RecordStateType = 'recording' | 'overdubbing' | 'stopped' | 'playing' ;
export type PlayerStateType = 'playing' | 'stopped';

export const STATE: any = {
	OVERDUBBING: 'overdubbing',
	RECORDING: 'recording',
	STOPPED: 'stopped',
	PLAYING: 'playing',
};
