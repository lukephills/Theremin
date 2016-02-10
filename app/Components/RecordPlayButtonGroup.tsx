import * as React from 'react';
import { connect } from 'react-redux';
import ToggleButton from './ToggleButton';

interface IProps {
}
interface  IState {
	isRecording?: boolean;
	isPlaying?: boolean;
}

class RecordPlayButtonGroup extends React.Component<IProps, IState> {

	constructor() {
		super();
		this.state = {
			isRecording: false,
			isPlaying: false,
		};
	}

	public render(): React.ReactElement<{}> {
		return (
			<section>
				<ToggleButton
					onClick={() => this.record()}
					isOn={this.state.isRecording}
					buttonValue="Record"/>

				<ToggleButton
					onClick={() => this.play()}
					isOn={this.state.isPlaying}
					buttonValue="Play"/>
			</section>
		);
	}

	private play() {
		if (this.state.isPlaying) {
			this.setState({isPlaying: false});
		} else {
			this.setState({isPlaying: true});
		}
	}

	private record() {
		if (this.state.isRecording) {
			this.setState({isRecording: false});
		} else {
			this.setState({isRecording: true});
		}
	}
}
export default RecordPlayButtonGroup;
