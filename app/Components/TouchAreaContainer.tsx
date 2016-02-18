import * as React from 'react';
//const _round = require('lodash/round');
import { connect } from 'react-redux';

import { style } from './Styles/styles';
import { IGlobalState } from '../Constants/GlobalState';
import MultiTouchView from './MultiTouchView';

interface IProps {
	width: number;
	height: number;
	start(pos, id): void;
	stop(pos, id): void;
	move(pos, id): void;
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
			    onDown={this.onDown.bind(this)}
			    onUp={this.onUp.bind(this)}
			    onMove={this.onMove.bind(this)}
			    onLeave={this.onLeave.bind(this)}
			/>
		);
	}

	private onDown(position, id: number = 0) {
		this.props.start(position, id);
	}
	private onUp(position, id: number = 0) {
		this.props.stop(position, id);
	}
	private onMove(position, id: number = 0) {
		this.props.move(position, id);
	}
	private onLeave(position, id: number = 0) {
		this.props.move(position, id);
	}
}

export default TouchAreaContainer;
