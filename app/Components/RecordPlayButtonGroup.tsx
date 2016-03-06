import * as React from 'react';
import { connect } from 'react-redux';
import ToggleButton from './ToggleButton';
import MultiStateSwitch from './MultiStateSwitch';
import {IGlobalState, IPlayer, IRecorder} from '../Constants/GlobalState';
import { Player, RecorderStateChange } from '../Actions/actions';
import StaticCanvas from './StaticCanvas';
import {STYLE_CONST} from './Styles/styles';
import {RecordStateType} from '../Constants/AppTypings';
import {ActionType} from '../Constants/ActionTypes';
import {STATE} from '../Constants/AppTypings';

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
	isPlaying: boolean;
}

function select(state: IGlobalState): any {
	return {
		isPlaying: state.Player.isPlaying,
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

				<ToggleButton
					disabled={this.props.isPlaybackDisabled}
					onDown={(e) => this.play(e)}
					isOn={this.props.isPlaying}>
					<StaticCanvas
						height={this.props.buttonSize}
						width={this.props.buttonSize}
						draw={this.draw}
						options={{id: 'play'}}
					/>
				</ToggleButton>

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
				ctx.beginPath();
				switch (this.props.recordState) {
					case STATE.STOPPED:
						// Record icon
						ctx.arc(cx, cy, (6*units), 0, 2 * Math.PI, false);
						break;
					case STATE.RECORDING:
						//TODO: Overdub icon
						ctx.strokeStyle = STYLE_CONST.RED;
						ctx.arc(cx, cy, (6*units), 0, 2 * Math.PI, false);

						ctx.moveTo(cx + (6*units),cy)
						ctx.lineTo(cx - (4*units), cy + (6*units));
						ctx.lineTo(cx - (4*units), cy - (6*units));
						ctx.closePath();
						break;
					case STATE.OVERDUBBING:
						// Stop icon
						ctx.strokeStyle = STYLE_CONST.RED;
						ctx.rect(cx - (6*units), cy - (6 * units), (12.2*units),  (12.2*units));
						break;
				}

				ctx.stroke();
				break;

			case 'play':
				if (this.props.isPlaybackDisabled) {
					ctx.strokeStyle = STYLE_CONST.GREY;
				}
				ctx.beginPath();
				if (this.props.isPlaying) {
					ctx.rect(cx - (6*units), cy - (6 * units), (12.2*units),  (12.2*units));
				} else {
					ctx.moveTo(cx + (6*units),cy)
					ctx.lineTo(cx - (4*units), cy + (6*units));
					ctx.lineTo(cx - (4*units), cy - (6*units));
					ctx.closePath();
				}
				ctx.stroke();
				break;

			case 'download':
				if (this.props.isPlaybackDisabled) {
					ctx.strokeStyle = STYLE_CONST.GREY;
				}
				ctx.beginPath();

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
				break;
		}
	}

	private play(e) {
		e.preventDefault();
		if (this.props.isPlaying) {
			this.props.dispatch(Player(false));
			this.props.onPlaybackButtonChange(false);
		} else {
			this.props.dispatch(Player(true));
			this.props.onPlaybackButtonChange(true);
		}

	}

	private record(e) {
		console.log(this.props.recordState);
		e.preventDefault();
		switch (this.props.recordState) {
			case STATE.RECORDING:
				this.props.dispatch(RecorderStateChange(STATE.OVERDUBBING));
				this.props.onRecordButtonChange(STATE.OVERDUBBING);
				break;
			case STATE.OVERDUBBING:
				this.props.dispatch(RecorderStateChange(STATE.STOPPED));
				this.props.onRecordButtonChange(STATE.STOPPED);
				break;
			case STATE.STOPPED:
				this.props.dispatch(RecorderStateChange(STATE.RECORDING));
				this.props.onRecordButtonChange(STATE.RECORDING);
				break;

		}

	}
}
export default RecordPlayButtonGroup;
