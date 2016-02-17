import * as React from 'react';
import { connect } from 'react-redux';
require('normalize.css');

import {style, STYLE_CONST} from './Styles/styles';
import RecordPlayButtonGroup from './RecordPlayButtonGroup';
import NoteGuideButton from './NoteGuideButton';
import WaveformSelectGroup from './WaveformSelectGroup';
import RangeSliderGroup from './RangeSliderGroup';
import TouchAreaContainer from './TouchAreaContainer';
import { WAVEFORMS, Defaults } from '../Constants/Defaults';
import {IGlobalState} from '../Constants/GlobalState';
import {ICoordinates} from './MultiTouchView';
import {createCanvas, getPixelRatio, canvasResize} from '../Utils/utils';
const Tone = require("Tone/core/Tone.js");




interface IState {
	delayVal?: number;
	feedbackVal?: number;
	guides?: boolean;
	isPlayingBack?: boolean;
	isRecording?: boolean;
	scuzzVal?: number;
	waveform?: string;
	windowHeight?: number;
	windowWidth?: number;
}

function select(state: IGlobalState, props) {
	//console.log(state, props);
	return {
		waveform: state.Waveform.wave,
		isPlayingBack: state.Player.isPlaying,
		isRecording: state.Recorder.isRecording,
		guides: state.NoteGuide.isOn,
		delayVal: state.Slider.delay,
		feedbackVal: state.Slider.feedback,
		scuzzVal: state.Slider.scuzz,
	};
}

@connect(select)
class App extends React.Component<any, IState> {

	private _clientHeight: number;
	//private _pitchMultiplier: number = Defaults.PitchMultiplier
	private frequencyMultiplier: number = 15;
	private mySpectrum;

	public Tone: Tone = new Tone();
	public context: AudioContext = this.Tone.context;

	// Gains
	public oscillatorGain: GainNode = this.context.createGain();
	public masterVolume: GainNode = this.context.createGain();
	public scuzzGain: GainNode = this.context.createGain();

	// Effects
	public filter: BiquadFilterNode = this.context.createBiquadFilter();
	public delay: DelayNode = this.context.createDelay();
	public feedback: GainNode = this.context.createGain();
	public compressor: DynamicsCompressorNode = this.context.createDynamicsCompressor();

	// Analyser
	public audioAnalyser: AnalyserNode = this.context.createAnalyser();

	// Oscillators
	public oscillator = this.context.createOscillator();
	public scuzz = this.context.createOscillator();

	public recordingExists: boolean = false;
	private isAnimating: boolean = false;
	private touchAreaHeight: number;
	private touchAreaWidth: number;
	public Canvas: HTMLCanvasElement;

	constructor(props) {
		super(props);
		this.RouteSounds();

		this.state = {
			delayVal: Defaults.Sliders.delay.value,
			feedbackVal: Defaults.Sliders.feedback.value,
			guides: Defaults.NoteGuideButton,
			isPlayingBack: false,
			isRecording: false,
			scuzzVal: Defaults.Sliders.scuzz.value,
			waveform: WAVEFORMS[Defaults.Waveform],
			windowHeight: window.innerHeight,
			windowWidth: window.innerWidth,
		};

		this.touchAreaHeight = this.state.windowHeight - (STYLE_CONST.TOP_PANEL_HEIGHT + (STYLE_CONST.PADDING * 2 ) +
			STYLE_CONST.BOTTOM_PANEL_HEIGHT);
		this.touchAreaWidth = this.state.windowWidth - (STYLE_CONST.PADDING*2);
		//Create canvas with the device resolution.
		this.Canvas = createCanvas(this.touchAreaWidth, this.touchAreaHeight);

		this.audioAnalyser.maxDecibels = -25;
		this.audioAnalyser.minDecibels = -100;
		this.audioAnalyser.smoothingTimeConstant = 0.85;


		this.Start = this.Start.bind(this);
		this.Stop = this.Stop.bind(this);
		this.Move = this.Move.bind(this);
		this.SliderChange = this.SliderChange.bind(this);
		this.SetWaveform = this.SetWaveform.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.Record = this.Record.bind(this);
		this.Playback = this.Playback.bind(this);


	}

	public componentDidMount() {
		window.addEventListener('resize', this.handleResize);
	}

	public componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	public render(): React.ReactElement<{}> {

		//const touchAreaHeight = this.state.windowHeight -
		//	( STYLE_CONST.TOP_PANEL_HEIGHT +
		//	//(STYLE_CONST.BORDER_WIDTH * 2) +
		//	(STYLE_CONST.PADDING * 2 )+
		//	STYLE_CONST.BOTTOM_PANEL_HEIGHT);
		//const touchAreaWidth = this.state.windowWidth - (STYLE_CONST.PADDING*2);

		return (
			<div id='body-wrapper'>
				<div style={style.title.container}>
					<span style={style.title.h1}>{Defaults.Title.toUpperCase()}</span>
				</div>
				<RecordPlayButtonGroup
					style={style.recordPlayButtonGroup.container}
				    onRecordButtonChange={this.Record}
				    onPlaybackButtonChange={this.Playback}
				    isPlaybackDisabled={!this.recordingExists}
				/>
				<NoteGuideButton
					style={style.noteGuideButton.container}
				/>
				<WaveformSelectGroup
					style={style.waveformSelectGroup.container}
				    waveformChange={this.SetWaveform}
				/>
				<TouchAreaContainer
					canvas={this.Canvas}
					width={this.touchAreaWidth}
					height={this.touchAreaHeight}
				    start={this.Start}
				    stop={this.Stop}
				    move={this.Move}
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
		this.touchAreaHeight = this.state.windowHeight - (STYLE_CONST.TOP_PANEL_HEIGHT + (STYLE_CONST.PADDING * 2 ) +
			STYLE_CONST.BOTTOM_PANEL_HEIGHT);
		this.touchAreaWidth = this.state.windowWidth - (STYLE_CONST.PADDING*2);

		// Resize the canvas element
		canvasResize(this.Canvas, this.touchAreaWidth, this.touchAreaHeight);
	}

	RouteSounds() {

		//this.setWaveform('square');
		this.oscillator.type = 'square';
		this.filter.type = 'lowpass';

		// Set slider values
		this.delay.delayTime.value = Defaults.Sliders.delay.value;
		this.feedback.gain.value = Defaults.Sliders.feedback.value;
		this.scuzzGain.gain.value = Defaults.Sliders.scuzz.value;

		this.oscillatorGain.gain.value = 0;
		this.masterVolume.gain.value = 0.5;


		this.scuzz.frequency.value = 400;
		this.scuzz.type = Defaults.Sliders.scuzz.waveform;

		// Connect the Scuzz
		this.scuzz.connect(this.scuzzGain);

		//TODO: CHECK THIS
		// Previously this:
		// this.scuzzVolume.connect(this.source.frequency);
		// But changed to this to fix older safari bug
		this.scuzzGain.connect(this.oscillator.detune as any);

		this.oscillator.connect(this.oscillatorGain);
		this.oscillatorGain.connect(this.filter);

		this.filter.connect(this.compressor);
		this.filter.connect(this.delay);

		this.delay.connect(this.feedback);
		this.delay.connect(this.compressor);
		this.feedback.connect(this.delay);

		this.compressor.connect(this.masterVolume);
		this.masterVolume.connect(this.audioAnalyser);
		this.audioAnalyser.connect(this.context.destination);

		//Start oscillators
		this.scuzz.start(0);
		this.oscillator.start(0);
	}

	Start(pos: ICoordinates){
		//Only start animating when the touch is down
		if (this.isAnimating === false) {
			this.DrawSpectrum();
		}

		this.SetFilterFrequency(pos.y);
		this.oscillatorGain.gain.value = 1;
		this.oscillator.frequency.value = pos.x * this.frequencyMultiplier;
	}
	Stop(pos: ICoordinates) {
		this.oscillator.frequency.value = pos.x * this.frequencyMultiplier;
		this.oscillatorGain.gain.value = 0;
	}

	Move(pos: ICoordinates) {
		this.oscillator.frequency.value = pos.x * this.frequencyMultiplier;
		this.SetFilterFrequency(pos.y);
	}

	SliderChange(slider, value) {
		switch (slider) {
			case 'delay':
				this.delay.delayTime.value = value;
			case 'feedback':
				this.feedback.gain.value = value;
			case 'scuzz':
				this.scuzzGain.gain.value = value;
			default:
				console.log(`Slider name ${slider} not found`);
		}
	}

	SetWaveform(value) {
		this.oscillator.type = value;
	}

	SetFilterFrequency(y: number) {
		this.filter.frequency.value = (this.Tone.context.sampleRate / 2) * (y / 100);
	}

	Record(isRecording: boolean){
		if (isRecording){
			this.recordingExists = true;
			console.log('recording...');
			//TODO: make recorder js an npm module
		} else {
			console.log('stopped recording')
		}
	}

	Playback(isPlayingBack: boolean) {
		if (this.recordingExists) {
			if (isPlayingBack){
				console.log('playing back recording..')
			} else {
				console.log('playback stopped.')
			}
		}
	}

	DrawSpectrum() {
		this.isAnimating = true;
		this.mySpectrum = requestAnimationFrame(this.DrawSpectrum.bind(this));

		const ctx = this.Canvas.getContext('2d');
		const pixelRatio = getPixelRatio();
		const width = this.Canvas.width/pixelRatio;
		const height = this.Canvas.height/pixelRatio;
		const barWidth = 6;
		const maxHeight = height - 2;
		const barSpacing = 9;
		// Calculate number of bars needed to fill canvas width
		const barCount: number = (width / (barSpacing + barWidth));
		const maxMag = 255;

		const freqByteData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
		this.audioAnalyser.getByteFrequencyData(freqByteData);

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
