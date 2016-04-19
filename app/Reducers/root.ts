import { combineReducers } from 'redux';
import { Waveform } from './rWaveform';
import { Recorder } from './rRecorder';
import { Player } from './rPlayer';
import { Slider } from './rSlider';
import { DownloadModal } from './rDownloadModal';
import { StartModal } from './rStartModal';
import { PlayButtonDisabled } from './rPlayButtonDisabled';

export default combineReducers({
	Waveform,
	Recorder,
	Player,
	Slider,
	DownloadModal,
	StartModal,
	PlayButtonDisabled,
});