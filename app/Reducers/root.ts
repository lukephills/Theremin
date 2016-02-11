import { combineReducers } from 'redux';
import { NoteGuide } from './rNoteGuide';
import { Waveform } from './rWaveform';
import { Recorder } from './rRecorder';
import { Player } from './rPlayer';
import { Slider } from './rSlider';

export default combineReducers({
	NoteGuide,
	Waveform,
	Recorder,
	Player,
	Slider,
});