import { combineReducers } from 'redux';
import { Waveform } from './rWaveform';
import { Recorder } from './rRecorder';
import { Player } from './rPlayer';
import { Slider } from './rSlider';
import { Modal } from './rModal';

export default combineReducers({
	Waveform,
	Recorder,
	Player,
	Slider,
	Modal,
});