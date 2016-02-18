import * as React from 'react';
import { connect } from 'react-redux';
import ToggleButton from './ToggleButton';
import {IGlobalState, IPlayer, IRecorder} from '../Constants/GlobalState';
import { Player, Recorder } from '../Actions/actions';

interface IProps extends IPlayer, IRecorder {
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

	constructor() {
		super();
	}

	public render(): React.ReactElement<{}> {
		const recordButtonValue = this.props.isRecording? 'Stop' : 'Record';
		const playButtonValue = this.props.isPlaying? 'Stop' : 'Play';

		return (
			<section style={this.props.style}>
				<ToggleButton
					onDown={(e) => this.record(e)}
					isOn={this.props.isRecording}
					buttonValue={recordButtonValue}/>

				<ToggleButton
					disabled={this.props.isPlaybackDisabled}
					onDown={(e) => this.play(e)}
					isOn={this.props.isPlaying}
					buttonValue={playButtonValue}/>

				<ToggleButton
					disabled={this.props.isPlaybackDisabled}
					onDown={this.props.onDownloadButtonChange}
					isOn={true}
					buttonValue="Download"/>
			</section>
		);
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
