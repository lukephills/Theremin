import { combineReducers } from 'redux';
import { Waveform } from './rWaveform';
import { Recorder } from './rRecorder';
import { Player } from './rPlayer';
import { Slider } from './rSlider';

export default combineReducers({
	Waveform,
	Recorder,
	Player,
	Slider,
});