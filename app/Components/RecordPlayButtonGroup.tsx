import * as React from 'react';
import { connect } from 'react-redux';
import ToggleButton from './ToggleButton';
import MultiStateSwitch from './MultiStateSwitch';
import {IGlobalState, IPlayer, IRecorder} from '../Constants/GlobalState';
import { PlayerStateChange, RecorderStateChange } from '../Actions/actions';
import StaticCanvas from './StaticCanvas';
import {STYLE_CONST} from './Styles/styles';
import {RecordStateType} from '../Constants/AppTypings';
import {ActionType} from '../Constants/ActionTypes';
import {STATE} from '../Constants/AppTypings';
import {PlayerStateType} from '../Constants/AppTypings';

interface IProps extends IPlayer, IRecorder {
	buttonSize: number;
	dispatch?: Function;
	style?: any;
	isPlaybackDisabled: boolean;
	onRecordButtonChange(recordState: RecordStateType): void;
	onPlaybackButtonChange(value: boolean): void;
	onDownloadButtonChange(): void;
}
interface  IState {
	recordState: RecordStateType;
	playerState: PlayerStateType;
}

function select(state: IGlobalState): any {
	return {
		playerState: state.Player.playerState,
		recordState: state.Recorder.recordState,
	};
}

@connect(select)
class RecordPlayButtonGroup extends React.Component<IProps, IState> {

	constructor(props) {
		super(props);
		this.draw = this.draw.bind(this);
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
					onDown={(e) => this.play(e)}>
					<StaticCanvas
						height={this.props.buttonSize}
						width={this.props.buttonSize}
						draw={this.draw}
						options={{id: 'play'}}
					/>
				</MultiStateSwitch>

				<ToggleButton
					disabled={this.props.isPlaybackDisabled}
					onDown={this.props.onDownloadButtonChange}
					isOn={true}>
					<StaticCanvas
						height={this.props.buttonSize}
						width={this.props.buttonSize}
						draw={this.draw}
						options={{id: 'download'}}
					/>
				</ToggleButton>
			</section>
		);
	}


	public draw(ctx: CanvasRenderingContext2D, width: number, height: number, options: any){
		var units = width/22;
		var cx = width/2;
		var cy = height/2;
		ctx.lineWidth = Math.floor(width/15);

		switch (options.id) {
			case 'record':
				console.log(this.props.recordState)
				ctx.beginPath();
				switch (this.props.recordState) {
					case STATE.STOPPED:
						this.drawIconRecord(ctx, cx, cy, units);
						break;
					case STATE.RECORDING:
						this.drawIconOverdub(ctx, cx, cy, units);
						break;
					case STATE.PLAYING:
						this.drawIconOverdub(ctx, cx, cy, units);
						break;
					case STATE.OVERDUBBING:
						this.drawIconStop(ctx, cx, cy, units);
						break;
				}
				ctx.stroke();
			break;

			case 'play':
				if (this.props.isPlaybackDisabled) {
					ctx.strokeStyle = STYLE_CONST.GREY;
				}
				ctx.beginPath();

				switch (this.props.playerState) {
					case STATE.PLAYING:
						this.drawIconStop(ctx, cx, cy, units)
					break;
					case STATE.STOPPED:
						this.drawIconPlay(ctx, cx, cy, units)
					break;
				}
				ctx.stroke();
			break;

			case 'download':
				if (this.props.isPlaybackDisabled) {
					ctx.strokeStyle = STYLE_CONST.GREY;
				}
				ctx.beginPath();

				this.drawIconDownload(ctx, cx, cy, units);
			break;
		}
	}

	private drawIconRecord(ctx, cx, cy, units) {
		ctx.arc(cx, cy, (6*units), 0, 2 * Math.PI, false);
	}

	private drawIconPlay(ctx, cx, cy, units) {
		ctx.moveTo(cx + (6*units),cy)
		ctx.lineTo(cx - (4*units), cy + (6*units));
		ctx.lineTo(cx - (4*units), cy - (6*units));
		ctx.closePath();
	}

	private drawIconOverdub(ctx, cx, cy, units){
		//TODO: Overdub icon
		ctx.strokeStyle = STYLE_CONST.RED;
		ctx.arc(cx, cy, (6*units), 0, 2 * Math.PI, false);

		ctx.moveTo(cx + (3*units), cy)
		ctx.lineTo(cx - (3*units), cy);
		ctx.lineTo(cx, cy);
		ctx.lineTo(cx, cy + (3*units));
		ctx.lineTo(cx, cy - (3*units));
		ctx.lineTo(cx, cy);

		ctx.closePath();
	}

	private drawIconStop(ctx, cx, cy, units) {
		ctx.strokeStyle = STYLE_CONST.RED;
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
			this.recorderChangeDispatch(STATE.STOPPED);
		}
		switch (this.props.playerState) {
			case STATE.PLAYING:
				this.playerChangeDispatch(STATE.STOPPED);
				this.recorderChangeDispatch(STATE.STOPPED);
			break;
			case STATE.STOPPED:
				this.playerChangeDispatch(STATE.PLAYING);
				if (this.props.recordState === STATE.STOPPED) {
					this.recorderChangeDispatch(STATE.PLAYING);
				}
			break;
		}
	}

	private record(e) {
		console.log(this.props.recordState);
		e.preventDefault();

		//if (this.props.playerState === STATE.PLAYING) {
		//	this.playerChangeDispatch(STATE.OVERDUBBING);
		//}

		switch (this.props.recordState) {
			case STATE.RECORDING:
				this.recorderChangeDispatch(STATE.OVERDUBBING);
				break;
			case STATE.OVERDUBBING:
				this.recorderChangeDispatch(STATE.STOPPED);
				break;
			case STATE.STOPPED:
				this.recorderChangeDispatch(STATE.RECORDING);
				break;
			case STATE.PLAYING:
				this.recorderChangeDispatch(STATE.OVERDUBBING);
				break;
		}
	}

	recorderChangeDispatch(newState){
		this.props.dispatch(RecorderStateChange(newState));
		this.props.onRecordButtonChange(newState);
	}

	playerChangeDispatch(newState){
		this.props.dispatch(PlayerStateChange(newState));
		this.props.onPlaybackButtonChange(newState);
	}
}
export default RecordPlayButtonGroup;
