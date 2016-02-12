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
class TouchArea extends React.Component<IProps, IState> {

	private currentTouches: ITouch[];

	constructor() {
		super();
		this.state = {pointerDown: false}
		this.currentTouches = [];
	}

	public render(): React.ReactElement<{}> {
		return (
			<canvas
				style={this.getStyles()}
				id="touchArea"
			    onMouseDown={(e) => this.onPointerDown(e)}
			    onTouchStart={(e) => this.onTouchStart(e)}
			    onMouseMove={(e) => this.onPointerMove(e)}
			    onTouchMove={(e) => this.onTouchMove(e)}
			    onMouseUp={(e) => this.onPointerUp(e)}
			    onTouchEnd={(e) => this.onTouchEnd(e)}
			    onMouseLeave={(e) => this.onPointerLeave(e)}
			    onTouchCancel={(e) => this.onTouchEnd(e)}
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
		console.log(this.state);
		e.preventDefault();
		this.setState({
			pointerDown: true,
		})
		const pos = this.getPositionAsPercentage(e);
		console.log('down',pos);
		console.log(this.props);
		console.log(e);
		//start playing
	}

	private onTouchStart(e) {
		e.preventDefault();
		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i];
			const pos = this.getPositionAsPercentage(touch);

			//Add this touch to list of touches
			this.currentTouches.push({
				id: touch.identifier,
				x: pos.x,
				y: pos.y,
			});
		}
		this.resetTouchesState();
		console.log('down', this.currentTouches);
	}

	private onPointerMove(e) {
		if (this.state.pointerDown){
			const pos = this.getPositionAsPercentage(e);
			console.log('move',pos);
		}
	}

	private onTouchMove(e) {
		e.preventDefault();
		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i];
			const pos = this.getPositionAsPercentage(touch);
			const currentTouchIndex = this.getCurrentTouchIndex(touch.identifier);

			if (currentTouchIndex >= 0){
				const currentTouch = this.currentTouches[currentTouchIndex];

				// Update the touch record.
				currentTouch.x = pos.x;
				currentTouch.y = pos.y;

				// Store the record.
				this.currentTouches.splice(currentTouchIndex, 1, currentTouch);
			} else {
				console.log(`touch not found`);
			}
		}
		this.resetTouchesState();
		console.log('move', this.currentTouches);
	}

	private onPointerUp(e) {
		e.preventDefault();
		this.setState({
			pointerDown: false,
		})
		//stop playing
		const pos = this.getPositionAsPercentage(e);
		console.log('up',pos);

		console.log(this.state);
	}

	private onTouchEnd(e) {
		e.preventDefault();
		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i];
			const pos = this.getPositionAsPercentage(touch);
			const currentTouchIndex = this.getCurrentTouchIndex(touch.identifier);

			if (currentTouchIndex >= 0) {
				var currentTouch = this.currentTouches[currentTouchIndex];

				// Remove the record.
				this.currentTouches.splice(currentTouchIndex, 1);
			} else {
				console.log('Touch was not found!');
			}
		}
		this.resetTouchesState();
		console.log('up', this.currentTouches);
	}

	private onPointerLeave(e) {
		e.preventDefault();
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

	private resetTouchesState(){
		this.setState({
			touches: this.currentTouches,
		});
	}

	private getCurrentTouchIndex(id) {
		for (var i=0; i < this.currentTouches.length; i++) {
			if (this.currentTouches[i].id === id) {
				return i;
			}
		}
		// Touch not found! Return -1.
		return -1;
	}
}

export default TouchArea;
