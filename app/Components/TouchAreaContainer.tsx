import * as React from 'react';
//const _round = require('lodash/round');
import { connect } from 'react-redux';

import { style } from './Styles/styles';
import { IGlobalState } from '../Constants/GlobalState';
import MultiTouchView from './MultiTouchView';

interface IProps {
	width: number;
	height: number;
	start(pos): void;
	stop(pos): void;
	move(pos): void;
	canvas?: HTMLCanvasElement;
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

	constructor() {
		super();
		this.state = {pointerDown: false}
		this.currentTouches = [];
	}

	public render(): React.ReactElement<{}> {

		return (
			<MultiTouchView
				width={this.props.width}
				height={this.props.height}
				canvas={this.props.canvas}
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
		this.props.start(position);
		//this.Audio.Start(position);
		//Start
	}
	private onMouseUp(position) {
		console.log('up', position);
		this.props.stop(position);
		//this.Audio.Stop(position);
		//Stop
	}
	private onMouseMove(position) {
		console.log('move', position);
		//this.Audio.Move(position);
		this.props.move(position);
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
