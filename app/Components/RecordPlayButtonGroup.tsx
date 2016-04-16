import * as React from 'react';
import { connect } from 'react-redux';
import ToggleButton from './ToggleButton';
import MultiStateSwitch from './MultiStateSwitch';
import {IGlobalState, IPlayer, IRecorder} from '../Constants/GlobalState';
import { PlayerStateChange, RecorderStateChange } from '../Actions/actions';
import StaticCanvas from './StaticCanvas';
import {STYLE_CONST} from './Styles/styles';
import {RecordStateType} from '../Constants/AppTypings';
import {STATE} from '../Constants/AppTypings';
import {PlayerStateType} from '../Constants/AppTypings';

interface IProps extends IPlayer, IRecorder {
	buttonSize: number;
	dispatch?: Function;
	style?: any;
	//isPlaybackDisabled: boolean;
	onRecordButtonChange(): void;
	onPlaybackButtonChange(): void;
	onDownloadButtonChange(): void;
}
interface IState {
	recordState?: RecordStateType;
	playerState?: PlayerStateType;
	downloadButtonHighlighted?: boolean;
}

function select(state: IGlobalState): any {
	return {
		playerState: state.Player.playerState,
		recordState: state.Recorder.recordState,
	};
}

@connect(select)
class RecordPlayButtonGroup extends React.Component<IProps, IState> {

	playButtonDisabled: boolean = true;
	private _touchIdentifiers;

	constructor(props) {
		super(props);

		this.state = {
			downloadButtonHighlighted: false,
		}
		this._touchIdentifiers = {}

		this.draw = this.draw.bind(this);
		this.onTouchEndDownloadButton = this.onTouchEndDownloadButton.bind(this);
		this.onTouchStartDownloadButton = this.onTouchStartDownloadButton.bind(this);
		this.onTouchCancelDownloadButton = this.onTouchCancelDownloadButton.bind(this);
	}

	public render(): React.ReactElement<{}> {
		return (
			<section style={this.props.style}>
				<MultiStateSwitch
					onDown={(e) => this.record(e)}>
					<StaticCanvas
						height={this.props.buttonSize}
						width={this.props.buttonSize}
						draw={this.draw}
						options={{id: 'record'}}
					/>
				</MultiStateSwitch>

				<MultiStateSwitch
					onDown={(e) => this.play(e)}
				    disabled={this.playButtonDisabled}
				>
					<StaticCanvas
						height={this.props.buttonSize}
						width={this.props.buttonSize}
						draw={this.draw}
						options={{id: 'play', disabled: this.playButtonDisabled}}
					/>
				</MultiStateSwitch>

				<ToggleButton
					disabled={this.playButtonDisabled}
					onTouchStart={this.onTouchStartDownloadButton}
					onTouchCancel={this.onTouchCancelDownloadButton}
					onTouchEnd={this.onTouchEndDownloadButton}
					isOn={true}>
					<StaticCanvas
						height={this.props.buttonSize}
						width={this.props.buttonSize}
						draw={this.draw}
						options={{id: 'download'}}
					    isActive={this.state.downloadButtonHighlighted}
					/>
				</ToggleButton>
			</section>
		);
	}

	onTouchStartDownloadButton(e: TouchEvent) {
		this.setState({downloadButtonHighlighted: true})
	}

	onTouchCancelDownloadButton(e: TouchEvent) {
		this.setState({downloadButtonHighlighted: false})
	}

	onTouchEndDownloadButton(e: TouchEvent) {
		this.setState({downloadButtonHighlighted: false})
		this.props.onDownloadButtonChange();
	}

	public draw(ctx: CanvasRenderingContext2D, width: number, height: number, options: any){
		var units = width/22;
		var cx = width/2;
		var cy = height/2;
		ctx.lineWidth = Math.floor(width/15);
		ctx.strokeStyle = STYLE_CONST.BLACK;

		switch (options.id) {
			case 'record':
				ctx.beginPath();
				switch (this.props.recordState) {
					case STATE.STOPPED:
						this.drawIconRecord(ctx, cx, cy, units);
						break;
					case STATE.RECORDING:
						this.drawIconOverdub(ctx, cx, cy, units, STYLE_CONST.RED);
						break;
					case STATE.PLAYING:
						this.drawIconOverdub(ctx, cx, cy, units, STYLE_CONST.BLACK);
						break;
					case STATE.OVERDUBBING:
						this.drawIconStop(ctx, cx, cy, units, STYLE_CONST.RED);
						break;
				}
				ctx.stroke();
			break;

			case 'play':
				ctx.beginPath();

				switch (this.props.playerState) {
					case STATE.PLAYING:
						this.drawIconStop(ctx, cx, cy, units, (this.playButtonDisabled ? STYLE_CONST.GREY : STYLE_CONST.RED))
					break;
					case STATE.STOPPED:
						this.drawIconPlay(ctx, cx, cy, units, (this.playButtonDisabled ? STYLE_CONST.GREY : STYLE_CONST.GREEN))
					break;
				}
				ctx.stroke();
			break;

			case 'download':
				if (this.playButtonDisabled) {
					ctx.strokeStyle = STYLE_CONST.GREY;
				}
				if (this.state.downloadButtonHighlighted) {
					ctx.strokeStyle = STYLE_CONST.GREEN;
				}
				ctx.beginPath();

				this.drawIconDownload(ctx, cx, cy, units);
			break;
		}
	}

	private drawIconRecord(ctx, cx, cy, units) {
		ctx.arc(cx, cy, (6*units), 0, 2 * Math.PI, false);
	}

	private drawIconPlay(ctx, cx, cy, units, color) {
		ctx.strokeStyle = color;
		ctx.moveTo(cx + (6*units),cy)
		ctx.lineTo(cx - (4*units), cy + (6*units));
		ctx.lineTo(cx - (4*units), cy - (6*units));
		ctx.closePath();
	}

	private drawIconOverdub(ctx, cx, cy, units, color){
		//TODO: Overdub icon
		ctx.strokeStyle = color;
		ctx.arc(cx, cy, (6*units), 0, 2 * Math.PI, false);

		ctx.moveTo(cx + (3*units), cy)
		ctx.lineTo(cx - (3*units), cy);
		ctx.lineTo(cx, cy);
		ctx.lineTo(cx, cy + (3*units));
		ctx.lineTo(cx, cy - (3*units));
		ctx.lineTo(cx, cy);

		ctx.closePath();
	}

	private drawIconStop(ctx, cx, cy, units, color) {
		ctx.strokeStyle = color;
		ctx.rect(cx - (6*units), cy - (6 * units), (12.2*units),  (12.2*units));
	}

	private drawIconDownload(ctx, cx, cy, units) {
		// Base
		ctx.moveTo(cx - (6*units), cy + (1 * units));
		ctx.lineTo(cx - (6*units), cy + (6*units));
		ctx.lineTo(cx + (6*units), cy + (6*units));
		ctx.lineTo(cx + (6*units), cy + (1 *units));

		// Arrow line
		ctx.moveTo(cx, cy - (8*units));
		ctx.lineTo(cx, cy + (3*units));

		// Arrow head
		ctx.moveTo(cx - (4*units), cy - (1*units));
		ctx.lineTo(cx, cy + (3*units));
		ctx.lineTo(cx + (4*units), cy - (1*units));
		ctx.stroke();
	}

	private play(e) {
		e.preventDefault();

		// Stop recording if play is pressed whilst recording/overdubbing
		if (this.props.recordState === (STATE.OVERDUBBING || STATE.RECORDING)) {
			this.recorderChangeDispatch(STATE.STOPPED, false);
		}
		switch (this.props.playerState) {
			case STATE.PLAYING:
				this.playerChangeDispatch(STATE.STOPPED);
				this.recorderChangeDispatch(STATE.STOPPED, false);
			break;
			case STATE.STOPPED:
				this.playerChangeDispatch(STATE.PLAYING);
				this.recorderChangeDispatch(STATE.PLAYING, false);
			break;
		}
	}

	private record(e) {
		e.preventDefault();

		this.playButtonDisabled = false;

		switch (this.props.recordState) {
			case STATE.RECORDING:
				this.recorderChangeDispatch(STATE.OVERDUBBING);
				break;
			case STATE.OVERDUBBING:
				this.recorderChangeDispatch(STATE.STOPPED);
				if (this.props.playerState === STATE.PLAYING){
					this.playerChangeDispatch(STATE.STOPPED, false);
				}
				break;
			case STATE.STOPPED:
				if (this.props.playerState === STATE.PLAYING){
					this.playerChangeDispatch(STATE.STOPPED, false);
					this.recorderChangeDispatch(STATE.OVERDUBBING);
				} else {
					this.recorderChangeDispatch(STATE.RECORDING);
				}
				break;
			case STATE.PLAYING:
				this.recorderChangeDispatch(STATE.OVERDUBBING);
				if (this.props.playerState === STATE.PLAYING){
					this.playerChangeDispatch(STATE.STOPPED, false);
				}
				break;
		}
	}

	recorderChangeDispatch(newState, buttonPressed: boolean = true){
		this.props.dispatch(RecorderStateChange(newState));
		if (buttonPressed) {
			this.props.onRecordButtonChange();
		}
	}

	playerChangeDispatch(newState, buttonPressed: boolean = true){
		this.props.dispatch(PlayerStateChange(newState));
		if (buttonPressed) {
			this.props.onPlaybackButtonChange();
		}
	}
}
export default RecordPlayButtonGroup;
