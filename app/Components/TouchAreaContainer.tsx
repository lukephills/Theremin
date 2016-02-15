import * as React from 'react';
//const _round = require('lodash/round');
import { connect } from 'react-redux';

import { style } from './Styles/styles';
import { IGlobalState } from '../Constants/GlobalState';
import MultiTouchView from './MultiTouchView';
import Audio from '../Audio';

interface IProps {
	width: number;
	height: number;
}

interface IState {
	pointerDown?: boolean;
	touches?: any; //Touch.identifiers
}

interface ITouch {
	id: number;
	x: number;
	y: number;
}

function select(state: IGlobalState): any {
	return {
		guides: state.NoteGuide.isOn,
		waveform: state.Waveform.wave,
		isRecording: state.Recorder.isRecording,
		isPlaying: state.Player
	};
}

@connect(select)
class TouchAreaContainer extends React.Component<IProps, IState> {

	private currentTouches: ITouch[];
	public Audio: Audio;

	constructor() {
		super();
		this.state = {pointerDown: false}
		this.currentTouches = [];
	}

	public componentDidMount() {
		this.Audio = new Audio();
		this.Audio.clientHeight = this.props.height;
	}

	public render(): React.ReactElement<{}> {

		return (
			<MultiTouchView
				width={this.props.width}
				height={this.props.height}
			    onMouseDown={this.onMouseDown.bind(this)}
			    onMouseUp={this.onMouseUp.bind(this)}
			    onMouseMove={this.onMouseMove.bind(this)}
			    onTouchStart={this.onTouchStart.bind(this)}
			    onTouchEnd={this.onTouchEnd.bind(this)}
			    onTouchMove={this.onTouchMove.bind(this)}
			/>
		);
	}

	private onMouseDown(position) {
		console.log('down', position);
		this.Audio.Start(position);
		//Start
	}
	private onMouseUp(position) {
		console.log('up', position);
		this.Audio.Stop(position);
		//Stop
	}
	private onMouseMove(position) {
		console.log('move', position);
		this.Audio.Move(position);
		//this.Audio.SetPitch(position)
		//Update Pitch
	}

	private onTouchStart(position, id: number) {
		console.log('down', position, id);
		//Start
	}
	private onTouchEnd(position, id: number) {
		console.log('up', position, id);
		//Stop
	}
	private onTouchMove(position, id: number) {
		console.log('move', position, id);
		//Update Pitch
	}

}

export default TouchAreaContainer;
