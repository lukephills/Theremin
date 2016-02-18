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

function select(state: IGlobalState) {
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

	private _frequencyMultiplier: number = 15;
	private _DrawSpectrumLoop: number;

	public tone: Tone = new Tone();
	public context: AudioContext = this.tone.context;
	public voiceCount: number = Defaults.VoiceCount;

	// Gains
	public masterVolume: GainNode = this.context.createGain();
	public oscillatorGains: GainNode[] = []
	public scuzzGain: GainNode = this.context.createGain();

	// Effects
	public compressor: DynamicsCompressorNode = this.context.createDynamicsCompressor();
	public delay: DelayNode = this.context.createDelay();
	public feedback: GainNode = this.context.createGain();
	public filters: BiquadFilterNode[] = [];

	// Analyser
	public audioAnalyser: AnalyserNode = this.context.createAnalyser();

	// Oscillators
	public oscillators: OscillatorNode[] = [];
	public scuzz: OscillatorNode = this.context.createOscillator();

	public canvas: HTMLCanvasElement;
	private _isAnimating: boolean = false;
	private _pixelRatio: number = getPixelRatio();
	private _touchAreaHeight: number;
	private _touchAreaWidth: number;
	private _recordingExists: boolean = false;

	constructor(props) {
		super(props);

		// AUDIO NODE SETUP
		for (let i = 0; i < this.voiceCount; i++) {
			this.oscillators.push(this.context.createOscillator());
			this.filters.push(this.context.createBiquadFilter());
			this.oscillatorGains.push(this.context.createGain());
		}

		this._routeSounds();

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

		this._touchAreaHeight = this.state.windowHeight - (STYLE_CONST.TOP_PANEL_HEIGHT + (STYLE_CONST.PADDING * 2 ) +
			STYLE_CONST.BOTTOM_PANEL_HEIGHT);
		this._touchAreaWidth = this.state.windowWidth - (STYLE_CONST.PADDING*2);
		//Create canvas with the device resolution.
		this.canvas = createCanvas(this._touchAreaWidth, this._touchAreaHeight);
		this._pixelRatio = getPixelRatio();

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
				<span>Get the app</span>
				<span>Subscribe</span>
				<span>TW</span>
				<span>FB</span>
				<RecordPlayButtonGroup
					style={style.recordPlayButtonGroup.container}
				    onRecordButtonChange={this.Record}
				    onPlaybackButtonChange={this.Playback}
				    isPlaybackDisabled={!this._recordingExists}
				/>
				{/*<NoteGuideButton
					style={style.noteGuideButton.container}
				/>*/}
				<WaveformSelectGroup
					style={style.waveformSelectGroup.container}
				    waveformChange={this.SetWaveform}
				/>
				<TouchAreaContainer
					canvas={this.canvas}
					width={this._touchAreaWidth}
					height={this._touchAreaHeight}
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
		this._touchAreaHeight = this.state.windowHeight - (STYLE_CONST.TOP_PANEL_HEIGHT + (STYLE_CONST.PADDING * 2 ) +
			STYLE_CONST.BOTTOM_PANEL_HEIGHT);
		this._touchAreaWidth = this.state.windowWidth - (STYLE_CONST.PADDING*2);

		// Resize the canvas element
		canvasResize(this.canvas, this._touchAreaWidth, this._touchAreaHeight);
	}

	private _routeSounds() {

		this.oscillators.forEach((oscillator) => {
			oscillator.type = 'square';
		});
		this.filters.forEach((filter) => {
			filter.type = 'lowpass';
		});

		// Set slider values
		this.delay.delayTime.value = Defaults.Sliders.delay.value;
		this.feedback.gain.value = Defaults.Sliders.feedback.value;
		this.scuzzGain.gain.value = Defaults.Sliders.scuzz.value;

		this.oscillatorGains.forEach((oscGain) => {
			oscGain.gain.value = 0;
		})
		this.masterVolume.gain.value = 0.5;


		this.scuzz.frequency.value = 400;
		this.scuzz.type = Defaults.Sliders.scuzz.waveform;

		// Connect the Scuzz
		this.scuzz.connect(this.scuzzGain);

		//TODO: CHECK THIS
		// Previously this:
		// this.scuzzVolume.connect(this.source.frequency);
		// But changed to this to fix older safari bug

		for (let i = 0; i < this.voiceCount; i++) {
			this.scuzzGain.connect(this.oscillators[i].detune as any);
			this.oscillators[i].connect(this.oscillatorGains[i]);
			this.oscillatorGains[i].connect(this.filters[i]);
			this.filters[i].connect(this.compressor);
			this.filters[i].connect(this.delay);
		}

		this.delay.connect(this.feedback);
		this.delay.connect(this.compressor);
		this.feedback.connect(this.delay);

		this.compressor.connect(this.masterVolume);
		this.masterVolume.connect(this.audioAnalyser);
		this.audioAnalyser.connect(this.context.destination);

		//Start oscillators
		this.scuzz.start();
		this.oscillators.forEach((osc) => {
			osc.start();
		})
	}

	public Start(pos: ICoordinates, id: number){
		//Only start animating when the touch is down
		//TODO: move this to after render function
		if (this._isAnimating === false) {
			this._DrawSpectrum();
		}

		if (id < this.voiceCount) {
			this.SetFilterFrequency(pos.y, id);
			this.oscillatorGains[id].gain.value = 1;
			this.oscillators[id].frequency.value = pos.x * this._frequencyMultiplier;
		}
	}
	public Stop(pos: ICoordinates, id: number) {
		if (id < this.voiceCount) {
			this.oscillators[id].frequency.value = pos.x * this._frequencyMultiplier;
			this.oscillatorGains[id].gain.value = 0;
		}
	}

	public Move(pos: ICoordinates, id: number) {
		if (id < this.voiceCount) {
			this.oscillators[id].frequency.value = pos.x * this._frequencyMultiplier;
			this.SetFilterFrequency(pos.y, id);
		}
	}

	public SliderChange(slider, value) {
		switch (slider) {
			case 'delay':
				this.delay.delayTime.value = value;
				break;
			case 'feedback':
				this.feedback.gain.value = value;
				break;
			case 'scuzz':
				this.scuzzGain.gain.value = value;
				break;
			default:
				console.log(`Slider name ${slider} not found`);
		}
		console.log('changed ', slider, 'to', value)
		console.log(this.feedback.gain.value)
	}

	public SetWaveform(value) {
		this.oscillators.forEach((osc) => {
			osc.type = value;
		});
	}

	public SetFilterFrequency(y: number, id: number) {
		if (id < this.voiceCount){
			this.filters[id].frequency.value = (this.tone.context.sampleRate / 2) * (y / 100);
		}
	}

	public Record(isRecording: boolean){
		if (isRecording){
			this._recordingExists = true;
			console.log('recording...');
			//TODO: make recorder js an npm module
		} else {
			console.log('stopped recording')
		}
	}

	public Playback(isPlayingBack: boolean) {
		if (this._recordingExists) {
			if (isPlayingBack){
				console.log('playing back recording..')
			} else {
				console.log('playback stopped.')
			}
		}
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
