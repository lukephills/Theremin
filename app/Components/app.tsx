import * as React from 'react';
import { connect } from 'react-redux';

import {STYLE, STYLE_CONST} from './Styles/styles';
import RecordPlayButtonGroup from './RecordPlayButtonGroup';
import WaveformSelectGroup from './WaveformSelectGroup';
import RangeSliderGroup from './RangeSliderGroup';
import MultiTouchView from './MultiTouchView';
import DownloadModal from './DownloadModal';
import StartModal from './StartModal';
import {WaveformStringType} from '../Constants/AppTypings';
import { WAVEFORMS, DEFAULTS } from '../Constants/Defaults';
import {IGlobalState} from '../Constants/GlobalState';
import Audio from '../Audio';
import { downloadModalChange, RecorderStateChange } from '../Actions/actions';

import Visibility from '../Utils/visibility';
import * as AudioUtils from '../Utils/AudioUtils';
import * as CanvasUtils from '../Utils/CanvasUtils';
import {IdentifierIndexMap, isCordovaIOS} from '../Utils/utils';
import Spectrum from './Spectrum';
import {RecordStateType} from '../Constants/AppTypings';
import {STATE} from '../Constants/AppTypings';
import {PlayerStateType} from '../Constants/AppTypings';


interface IState {
	delayVal?: number;
	feedbackVal?: number;
	playerState?: PlayerStateType;
	recordState?: RecordStateType;
	isDownloadOverlayActive?: boolean;
	scuzzVal?: number;
	waveform?: string;
	windowHeight?: number;
	windowWidth?: number;
	_touchAreaHeight?: number;
	_touchAreaWidth?: number;
}

function select(state: IGlobalState) {
	return {
		waveform: state.Waveform.wave,
		playerState: state.Player.playerState,
		recordState: state.Recorder.recordState,
		delayVal: state.Slider.delay,
		feedbackVal: state.Slider.feedback,
		scuzzVal: state.Slider.scuzz,
		isDownloadModalOpen: state.DownloadModal.isOpen,
		isStartModalOpen: state.StartModal.isOpen,
	};
}

@connect(select)
class App extends React.Component<any, IState> {

	public canvas: HTMLCanvasElement;
	public spectrumLive: Spectrum;
	public spectrumRecording: Spectrum;
	private _isAnimating: boolean = false;
	private _pixelRatio: number = CanvasUtils.getPixelRatio();
	private _touchAreaHeight: number;
	private _touchAreaWidth: number;
	private _DrawAnimationFrame: number;
	private touches: IdentifierIndexMap;


	constructor(props) {
		super(props);

		this.state = {
			delayVal: DEFAULTS.Sliders.delay.value,
			feedbackVal: DEFAULTS.Sliders.feedback.value,
			playerState: STATE.STOPPED,
			recordState: STATE.STOPPED,
			isDownloadOverlayActive: false,
			scuzzVal: DEFAULTS.Sliders.scuzz.value,
			waveform: WAVEFORMS[DEFAULTS.Waveform],
			windowHeight: window.innerHeight,
			windowWidth: window.innerWidth,
		};

		this.updateSize();

		//Create canvas with the device resolution.
		this.canvas = CanvasUtils.createCanvas(this._touchAreaWidth, this._touchAreaHeight);
		this._pixelRatio = CanvasUtils.getPixelRatio();

		this.touches = new IdentifierIndexMap();
		this.spectrumLive = new Spectrum(this.canvas, Audio.analysers.live);
		this.spectrumRecording = new Spectrum(this.canvas, Audio.analysers.recording);

		this.Start = this.Start.bind(this);
		this.Stop = this.Stop.bind(this);
		this.Move = this.Move.bind(this);
		this.SliderChange = this.SliderChange.bind(this);
		this.SetWaveform = this.SetWaveform.bind(this);
		this.Record = this.Record.bind(this);
		this.Playback = this.Playback.bind(this);
		this.Download = this.Download.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.startPress = this.startPress.bind(this);
	}

	get mobileLandscapeSize(): boolean {
		return this.state.windowHeight < 450 && (this.state.windowWidth > this.state.windowHeight);
	}

	get smallScreen(): boolean {
		return this.state.windowHeight < 600;
	}

	private updateSize() {
		const topPanelHeight = this.mobileLandscapeSize ? STYLE_CONST.TOP_PANEL_HEIGHT_MOBILE_LANDSCAPE : STYLE_CONST.TOP_PANEL_HEIGHT;
		const bottomPanelHeight = this.smallScreen ? STYLE_CONST.BOTTOM_PANEL_HEIGHT_MOBILE : STYLE_CONST.BOTTOM_PANEL_HEIGHT

		const statusBarHeight = this.getStatusBarHeight();

		this._touchAreaHeight = this.state.windowHeight - (statusBarHeight +
			topPanelHeight + (STYLE_CONST.PADDING * 2) +
			bottomPanelHeight);
		this._touchAreaWidth = this.state.windowWidth - (STYLE_CONST.PADDING * 2);
	}



	private getStatusBarHeight(): number {
		let h = 0;
		if (isCordovaIOS() && this.state.windowWidth < this.state.windowHeight) {
			h = 20;
		}
		return h;
	}


	public componentDidMount() {
		window.addEventListener('resize', this.handleResize);

		// Make sure all sounds stop when app is awoken.
		Visibility.onVisible = () => {
			Audio.StopAll();
		}

		// Stop when switch to another tab in browser
		Visibility.onInvisible = () => {
			Audio.StopAll();
		}
	}

	public componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	public render(): React.ReactElement<{}> {
		const mobileSizeSmall = this.state.windowWidth < 512;
		const mobileSizeLarge = this.state.windowWidth < 600;
		const mobileLandscape = this.mobileLandscapeSize;

		let buttonSize = this.state.windowWidth > 600 ? 50 : (this.state.windowWidth / 9);
		buttonSize = buttonSize < 50 ? buttonSize : 50;

		const titleStyle = Object.assign({},
			STYLE.title.h1,
			mobileSizeLarge && STYLE.title.h1_mobileSizeLarge,
			mobileSizeSmall && STYLE.title.h1_mobileSizeSmall,
			mobileLandscape && STYLE.title.h1_mobileLandscape,
			mobileLandscape && mobileSizeSmall && STYLE.title.h1_mobileSizeSmall
		);

		const statusBarHeight = this.getStatusBarHeight();
		const statusBarStyle = Object.assign({}, {marginTop: statusBarHeight});

		return (
			<div id='body-wrapper' onTouchMove={(e)=> e.preventDefault()}>
				<div style={
					Object.assign({},
						STYLE.topPanel,
						statusBarStyle,
						mobileLandscape && STYLE.topPanel_mobileLandscape
					)}>
					<div style={Object.assign({},STYLE.title.container,
					mobileSizeSmall && STYLE.title.container_mobile,
					mobileLandscape && STYLE.title.container_mobileLandscape)}>
						<span style={titleStyle}>{DEFAULTS.Title.toUpperCase()}</span>
					</div>
					<RecordPlayButtonGroup
						style={Object.assign({},STYLE.recordPlayButtonGroup.container,
							mobileSizeSmall && STYLE.recordPlayButtonGroup.container_mobile)}
						onRecordButtonChange={this.Record}
						onPlaybackButtonChange={this.Playback}
						onDownloadButtonChange={this.Download}
					    buttonSize={buttonSize}
					    maxLoopDuration={Audio.looper.maxLoopDuration}
					/>
					<WaveformSelectGroup
						style={Object.assign({},STYLE.waveformSelectGroup.container,
							mobileSizeSmall && STYLE.waveformSelectGroup.container_mobile)}
						waveformChange={this.SetWaveform}
						buttonSize={buttonSize}
					/>
				</div>

				<MultiTouchView
					canvas={this.canvas}
					width={this._touchAreaWidth}
					height={this._touchAreaHeight}
				    onDown={this.Start}
				    onUp={this.Stop}
				    onMove={this.Move}
				    onLeave={this.Stop}
				/>
				<RangeSliderGroup
					sliderChange={this.SliderChange}
				    smallScreen={this.smallScreen}
				    windowWidth={this.state.windowWidth}
			    />
				<DownloadModal
					isActive={this.props.isDownloadModalOpen}
				    style={Object.assign({},STYLE.downloadModal)}
					windowWidth={this.state.windowWidth}
				    windowHeight={this.state.windowHeight}
				/>
				<StartModal
					isActive={this.props.isStartModalOpen}
					onStartPress={this.startPress}
					style={Object.assign({}, STYLE.startModal)}
				/>
			</div>
		);
	}

	private startPress(cb) {
		this.handleResize();
		AudioUtils.startIOSAudio(Audio.context, cb);

		// Sometimes IOS changes the sample rate to 48000 and everyting sounds distorted
		// Found answer from this:
		// http://stackoverflow.com/questions/17892345/webkit-audio-distorts-on-ios-6-iphone-5-first-time-after-power-cycling/34501159#34501159
		if (Audio.context.sampleRate === 48000) {
			Audio.context = new AudioContext();
			AudioUtils.startIOSAudio(Audio.context, cb);
		}
	}

	private handleResize() {
		this.setState({
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight,
		});

		this.updateSize();
		// Resize the canvas element
		CanvasUtils.canvasResize(this.canvas, this._touchAreaWidth, this._touchAreaHeight);
		this.forceUpdate();
	}

	public Start(e: Event, identifier: number = 0): void {
		const index = this.touches.Add(identifier);
		const pos: CanvasUtils.ICoordinates = CanvasUtils.getPercentagePosition(e);
		//Only start animating when the touch is down
		if (this._isAnimating === false) {
			this.Draw();
		}
		Audio.Start(pos, index);
	}

	public Stop(e: Event, identifier: number = 0): void {
		const index = this.touches.GetIndexFromIdentifier(identifier);
		const pos: CanvasUtils.ICoordinates = CanvasUtils.getPercentagePosition(e);
		Audio.Stop(pos, index);

		//Remove from list of touch ids
		this.touches.Remove(identifier)
	}

	public Move(e: Event, id: number = 0) {
		const index = this.touches.GetIndexFromIdentifier(id);
		const pos: CanvasUtils.ICoordinates = CanvasUtils.getPercentagePosition(e);
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
				console.error(`Slider name ${slider} not found`);
				break;
		}
	}

	public SetWaveform(value: WaveformStringType) {
		Audio.SetWaveform(value);
	}

	public Record(){
		Audio.onRecordPress();
	}

	public Playback() {
		Audio.onPlaybackPress();
	}

	public Download() {
		this.props.dispatch(downloadModalChange(true));
		this.setState({isDownloadOverlayActive: true})
	}

	private Draw() {
		this._isAnimating = true;
		this._DrawAnimationFrame = requestAnimationFrame(this.Draw.bind(this));

		const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
		const width: number = this.canvas.width / this._pixelRatio;
		const height: number = this.canvas.height / this._pixelRatio;

		ctx.clearRect(0, 0, width, height);

		let liveColor = STYLE_CONST.BLACK;
		switch (this.props.recordState) {
			case 'recording':
				liveColor = STYLE_CONST.RED
				break;
			case 'overdubbing':
				liveColor = STYLE_CONST.RED
				break;
			case 'stopped':
				liveColor = STYLE_CONST.BLACK
				break;
		}

		this.spectrumRecording.Draw({
			isActive: this._isAnimating,
			color: STYLE_CONST.GREY,
		});

		this.spectrumLive.Draw({
			isActive: this._isAnimating,
			color: liveColor,
		});

	}

}

export default App;
