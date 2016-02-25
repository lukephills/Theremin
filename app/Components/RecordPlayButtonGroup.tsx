import * as React from 'react';
import { connect } from 'react-redux';
import ToggleButton from './ToggleButton';
import {IGlobalState, IPlayer, IRecorder} from '../Constants/GlobalState';
import { Player, Recorder } from '../Actions/actions';
import StaticCanvas from './StaticCanvas';
import {STYLE_CONST} from './Styles/styles';

interface IProps extends IPlayer, IRecorder {
	buttonSize: number;
	dispatch?: Function;
	style?: any;
	isPlaybackDisabled: boolean;
	onRecordButtonChange(value: boolean): void;
	onPlaybackButtonChange(value: boolean): void;
	onDownloadButtonChange(): void;
}
interface  IState {
	isRecording: boolean;
	isPlaying: boolean;
}

function select(state: IGlobalState): any {
	return {
		isPlaying: state.Player.isPlaying,
		isRecording: state.Recorder.isRecording,
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
				<ToggleButton
					onDown={(e) => this.record(e)}
					isOn={this.props.isRecording}>
					<StaticCanvas
						height={this.props.buttonSize}
						width={this.props.buttonSize}
						draw={this.draw}
						options={{id: 'record'}}
					/>
				</ToggleButton>

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

		console.log('draw')

		switch (options.id) {
			case 'record':
				if (this.props.isRecording) {
					ctx.strokeStyle = STYLE_CONST.RED;
				}
				ctx.beginPath();
				if (this.props.isRecording) {
					ctx.rect(cx - (6*units), cy - (6 * units), (12.2*units),  (12.2*units));
				} else {
					ctx.arc(cx, cy, (6*units), 0, 2 * Math.PI, false);
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
				ctx.moveTo(cx - (6*units), cy - (6 * units));
				ctx.lineTo(cx - (6*units), cy + (6*units));
				ctx.lineTo(cx + (6*units), cy + (6*units));
				ctx.lineTo(cx + (6*units), cy - (3*units));
				ctx.lineTo(cx + (3*units), cy - (6*units));
				ctx.closePath();

				//Inner square
				ctx.rect(cx - (3*units), cy - (6 * units), (5*units),  (5*units));
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
		e.preventDefault();
		if (this.props.isRecording) {
			this.props.dispatch(Recorder(false));
			this.props.onRecordButtonChange(false);
		} else {
			this.props.dispatch(Recorder(true));
			this.props.onRecordButtonChange(true);
		}
	}
}
export default RecordPlayButtonGroup;
