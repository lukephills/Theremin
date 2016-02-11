import * as React from 'react';
const _round = require('lodash/round');
import { connect } from 'react-redux';

import { style } from './Styles/styles';
import { IGlobalState } from '../Constants/GlobalState';

interface ICoordinates {
	x: number;
	y: number;
}

interface IProps {
	width: number;
	height: number;
}

interface IState {
	pointerDown: boolean;
}

function select(state: IGlobalState): any {
	return {
		guides: state.NoteGuide.isOn,
		waveform: state.Waveform.wave,
		isRecording: state.Recorder.isRecording,
		isPlaying: state.Player.isPlaying,
	};
}

@connect(select)
class TouchArea extends React.Component<IProps, IState> {
	constructor() {
		super();
		this.state = {pointerDown: false}
	}

	public render(): React.ReactElement<{}> {
		return (
			<canvas
				style={this.getStyles()}
				id="touchArea"
			    onMouseDown={(e) => this.onPointerDown(e)}
			    onMouseMove={(e) => this.onPointerMove(e)}
			    onMouseUp={(e) => this.onPointerUp(e)}
			    onMouseLeave={(e) => this.onPointerLeave(e)}
			/>
		);
	}

	private getStyles() {
		const { width, height } = this.props;
		return Object.assign(
			{},
			style.touchArea,
			{
				width,
				height,
			}
		);
	}

	private onPointerDown(e) {
		this.setState({
			pointerDown: true,
		})
		const pos = this.getPositionAsPercentage(e);
		console.log('down',pos);
		console.log(this.props);
		//start playing
	}

	private onPointerMove(e) {
		if (this.state.pointerDown){
			const pos = this.getPositionAsPercentage(e);
			console.log('move',pos);

			//update playing
		}
	}

	private onPointerUp(e) {
		if (this.state.pointerDown){
			this.setState({
				pointerDown: false,
			})
			//stop playing
			const pos = this.getPositionAsPercentage(e);
			console.log('up',pos);
		}
	}

	private onPointerLeave(e) {
		if (this.state.pointerDown) {
			this.setState({
				pointerDown: false,
			})
			const pos = this.getPositionAsPercentage(e);
			console.log('left', pos)
			//Stop playing
		}
	}

	private getPositionAsPercentage(e): ICoordinates {
		return {
			x: _round(((e.pageX - e.target.offsetLeft) / e.target.offsetWidth) * 100, 2),
			y: _round((100 - ((e.pageY - e.target.offsetTop) / e.target.offsetHeight) * 100), 2),
		}
	}
}

export default TouchArea;
