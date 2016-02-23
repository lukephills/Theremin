import * as React from 'react';
import { connect } from 'react-redux';
require('normalize.css');

import {style, STYLE_CONST} from './Styles/styles';
import RecordPlayButtonGroup from './RecordPlayButtonGroup';
import WaveformSelectGroup from './WaveformSelectGroup';
import RangeSliderGroup from './RangeSliderGroup';
import MultiTouchView from './MultiTouchView';
import { WAVEFORMS, Defaults } from '../Constants/Defaults';
import {IGlobalState} from '../Constants/GlobalState';
import {ICoordinates} from './MultiTouchView';
import Audio from '../Audio';

import '../Utils/Recorder/recorder'; //TODO: make recorder js an npm module
import Visibility from '../Utils/visibility';
import * as AudioUtils from '../Utils/AudioUtils';
import * as CanvasUtils from '../Utils/CanvasUtils';
import {IdentifierIndexMap} from '../Utils/utils';



interface IState {
	delayVal?: number;
	feedbackVal?: number;
	isPlayingBack?: boolean;
	isRecording?: boolean;
	scuzzVal?: number;
	waveform?: string;
	windowHeight?: number;
	windowWidth?: number;
}

function select(state: IGlobalState) {
	return {
		waveform: state.Waveform.wave,
		isPlayingBack: state.Player.isPlaying,
		isRecording: state.Recorder.isRecording,
		delayVal: state.Slider.delay,
		feedbackVal: state.Slider.feedback,
		scuzzVal: state.Slider.scuzz,
	};
}

@connect(select)
class App extends React.Component<any, IState> {

	//private _frequencyMultiplier: number = 15;
	private _DrawSpectrumLoop: number;


	public canvas: HTMLCanvasElement;
	private _isAnimating: boolean = false;
	private _pixelRatio: number = CanvasUtils.getPixelRatio();
	private _touchAreaHeight: number;
	private _touchAreaWidth: number;
	private hasRecording: boolean = false;

	private touches: IdentifierIndexMap;


	constructor(props) {
		super(props);


		this.state = {
			delayVal: Defaults.Sliders.delay.value,
			feedbackVal: Defaults.Sliders.feedback.value,
			isPlayingBack: false,
			isRecording: false,
			scuzzVal: Defaults.Sliders.scuzz.value,
			waveform: WAVEFORMS[Defaults.Waveform],
			windowHeight: window.innerHeight,
			windowWidth: window.innerWidth,
		};

		this._touchAreaHeight = this.state.windowHeight - (STYLE_CONST.TOP_PANEL_HEIGHT + (STYLE_CONST.PADDING * 2 ) +
			STYLE_CONST.BOTTOM_PANEL_HEIGHT);
		this._touchAreaWidth = this.state.windowWidth - (STYLE_CONST.PADDING*2);
		//Create canvas with the device resolution.
		this.canvas = CanvasUtils.createCanvas(this._touchAreaWidth, this._touchAreaHeight);
		this._pixelRatio = CanvasUtils.getPixelRatio();

		this.touches = new IdentifierIndexMap();

		this.Start = this.Start.bind(this);
		this.Stop = this.Stop.bind(this);
		this.Move = this.Move.bind(this);
		this.SliderChange = this.SliderChange.bind(this);
		this.SetWaveform = this.SetWaveform.bind(this);
		this.Record = this.Record.bind(this);
		this.Playback = this.Playback.bind(this);
		this.Download = this.Download.bind(this);
		this.handleResize = this.handleResize.bind(this);
	}

	public componentDidMount() {
		window.addEventListener('resize', this.handleResize);

		// Make sure all sounds stop when app is awoken.
		Visibility.onVisible = () => {
			Audio.StopAll();
			console.log('onVisible called!');
		}

		// Stop when switch to another tab in browser
		Visibility.onInvisible = () => {
			Audio.StopAll();
			console.log('onInvisible called!');
		}
	}

	public componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	public render(): React.ReactElement<{}> {

		return (
			<div id='body-wrapper'>
				<div style={style.title.container}>
					<span style={style.title.h1}>{Defaults.Title.toUpperCase()}</span>
				</div>
				<RecordPlayButtonGroup
					style={style.recordPlayButtonGroup.container}
				    onRecordButtonChange={this.Record}
				    onPlaybackButtonChange={this.Playback}
				    isPlaybackDisabled={!this.hasRecording}
				    onDownloadButtonChange={this.Download}
				/>
				<WaveformSelectGroup
					style={style.waveformSelectGroup.container}
				    waveformChange={this.SetWaveform}
				/>
				<MultiTouchView
					canvas={this.canvas}
					width={this._touchAreaWidth}
					height={this._touchAreaHeight}
				    onDown={this.Start}
				    onUp={this.Stop}
				    onMove={this.Move}
				    onLeave={this.Move}
				    onFirstTouch={() => AudioUtils.startIOSAudio(Audio.context)}
				/>
				<RangeSliderGroup
					sliderChange={this.SliderChange}
			    />
			</div>
		);
	}

	private handleResize() {
		this.setState({
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight,
		});
		this._touchAreaHeight = this.state.windowHeight - (STYLE_CONST.TOP_PANEL_HEIGHT + (STYLE_CONST.PADDING * 2 ) +
			STYLE_CONST.BOTTOM_PANEL_HEIGHT);
		this._touchAreaWidth = this.state.windowWidth - (STYLE_CONST.PADDING*2);

		// Resize the canvas element
		CanvasUtils.canvasResize(this.canvas, this._touchAreaWidth, this._touchAreaHeight);
	}





	public Start(pos: ICoordinates = {x:0,y:0}, identifier: number = 0){
		//console.log('start', pos, id)
		const index = this.touches.Add(identifier);
		//Only start animating when the touch is down
		//TODO: move this to after render function
		if (this._isAnimating === false) {
			this._DrawSpectrum();
		}

		Audio.Start(pos, index);
	}
	public Stop(pos: ICoordinates = {x:0,y:0}, identifier: number = 0) {
		const index = this.touches.GetIndexFromIdentifier(identifier);
		Audio.Stop(pos, index);

		//Remove from list of touch ids
		this.touches.Remove(identifier)
	}



	public Move(pos: ICoordinates = {x:0,y:0}, id: number = 0) {
		//console.log('move', pos, id);
		const index = this.touches.GetIndexFromIdentifier(id);
		Audio.Move(pos, index);
	}

	public SliderChange(slider, value) {
		switch (slider) {
			case 'delay':
				Audio.delay.delayTime.value = value;
				break;
			case 'feedback':
				Audio.feedback.gain.value = value;
				break;
			case 'scuzz':
				Audio.scuzzGain.gain.value = value;
				break;
			default:
				console.log(`Slider name ${slider} not found`);
		}
		console.log('changed ', slider, 'to', value);
	}


	public SetWaveform(value) {
		Audio.SetWaveform(value);
	}


	public Record(isRecording: boolean){
		if (isRecording){
			console.log('recording...');
			Audio.StartRecorder();
		} else {
			this.hasRecording = true;
			Audio.StopRecorder();
			console.log('stopped recording');
		}
	}

	public Playback(isPlayingBack: boolean) {
		if (this.hasRecording) {
			if (isPlayingBack){
				Audio.StartPlayback();
			} else {
				Audio.StopPlayback();
			}
		}
	}

	public Download() {
		console.log('downloading recording..');

		Audio.onExportWav = (recording: Blob) => {
			const url = (window.URL || (window as any).webkitURL).createObjectURL(recording);
			const link: HTMLAnchorElement = document.createElement('a');
			link.href = url;

			const downloadAttrSupported: boolean = ('download' in link);
			if (downloadAttrSupported) {
				link.setAttribute('download', 'theremin.wav');
				let click = document.createEvent("Event");
				click.initEvent("click", true, true);
				link.dispatchEvent(click);
			} else {
				// Show the anchor link with instructions to 'right click save as'
				link.innerHTML = 'right click save as'
				document.body.appendChild(link); //FIXME: append to a pop up box instead of body
				//TODO: could use this to trigger a saveAs() https://github.com/koffsyrup/FileSaver.js
			}
		}
		Audio.Download();
	}

	private _DrawSpectrum() {
		this._isAnimating = true;
		this._DrawSpectrumLoop = requestAnimationFrame(this._DrawSpectrum.bind(this));

		const ctx = this.canvas.getContext('2d');
		const pixelRatio = this._pixelRatio;
		const width = this.canvas.width/pixelRatio;
		const height = this.canvas.height/pixelRatio;
		const barWidth = 6;
		const maxHeight = height - 2;
		const barSpacing = 9;
		// Calculate number of bars needed to fill canvas width
		const barCount: number = (width / (barSpacing + barWidth));
		const maxMag = 255;

		const freqByteData = new Uint8Array(Audio.audioAnalyser.frequencyBinCount);
		Audio.audioAnalyser.getByteFrequencyData(freqByteData);

		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = STYLE_CONST.BLACK;

		for (let i = 0; i < barCount; i++) {
			// Calculate the magnitude based on byte data and max bar height
			const magnitude = freqByteData[i] / (maxMag / maxHeight);
			ctx.fillRect((barWidth + barSpacing) * i, height, barWidth, -magnitude);
		}
	}

}
export default App;
