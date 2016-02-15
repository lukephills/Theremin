import * as React from 'react';
const _round = require('lodash/round');
import { connect } from 'react-redux';

import { noOp } from '../Utils/utils';
import { style } from './Styles/styles';
import { IGlobalState } from '../Constants/GlobalState';

interface ICoordinates {
	x: number;
	y: number;
}

interface IProps {
	width: number;
	height: number;
	onMouseDown?: () => any;
	onTouchStart?: () => any;
	onMouseMove?: () => any;
	onTouchMove?: () => any;
	onMouseUp?: () => any;
	onTouchEnd?: () => any;
	onMouseLeave?: () => any;
	onTouchCancel?: () => any;
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
class MultiTouchView extends React.Component<IProps, IState> {

	private currentTouches: ITouch[];

	constructor() {
		super();
		this.state = {pointerDown: false}
		this.currentTouches = [];
	}

	public render(): React.ReactElement<{}> {
		const {
			onMouseDown,
			onTouchStart,
			onMouseMove,
			onTouchMove,
			onMouseUp,
			onTouchEnd,
			onMouseLeave,
			onTouchCancel } = this.props
		return (
			<canvas
				style={this.getStyles()}
				id="touchArea"
			    onMouseDown={(e) => this.onMouseDown(e, onMouseDown)}
				onMouseUp={(e) => this.onMouseUp(e, onMouseUp)}
				onMouseMove={(e) => this.onMouseMove(e, onMouseMove)}
				onMouseLeave={(e) => this.onMouseLeave(e, onMouseLeave)}
			    onTouchStart={(e) => this.onTouchStart(e, onTouchStart)}
				onTouchEnd={(e) => this.onTouchEnd(e, onTouchEnd)}
			    onTouchMove={(e) => this.onTouchMove(e, onTouchMove)}
			    onTouchCancel={(e) => this.onTouchEnd(e, onTouchCancel)}
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

	private onMouseDown(e, callback = noOp) {
		//console.log(this.state);
		e.preventDefault();
		this.setState({
			pointerDown: true,
		})
		const pos = this.getPositionAsPercentage(e);
		callback(pos);
	}

	private onTouchStart(e, callback = noOp) {
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

			callback(pos, touch.identifier);
		}
		this.updateTouchesState();
	}

	private onMouseMove(e, callback = noOp) {
		//only do something if we have pointers down
		if (this.state.pointerDown || (this.state.touches && this.state.touches.length)){
			const pos = this.getPositionAsPercentage(e);
			callback(pos);
		}
	}

	private onTouchMove(e, callback = noOp) {
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

				// Update this touches pitch
				callback(pos, touch.identifier)

				// Store the record.
				this.currentTouches.splice(currentTouchIndex, 1, currentTouch);
			} else {
				console.log(`touch not found`);
			}
		}
		this.updateTouchesState();
	}

	private onMouseUp(e, callback = noOp) {
		e.preventDefault();
		this.setState({
			pointerDown: false,
		})
		const pos = this.getPositionAsPercentage(e);
		callback(pos);
	}

	private onTouchEnd(e, callback = noOp) {
		e.preventDefault();
		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i];
			const pos = this.getPositionAsPercentage(touch);
			const currentTouchIndex = this.getCurrentTouchIndex(touch.identifier);

			if (currentTouchIndex >= 0) {
				var currentTouch = this.currentTouches[currentTouchIndex];
				callback(pos, touch.identifier)
				// Remove the record.
				this.currentTouches.splice(currentTouchIndex, 1);
			} else {
				console.log('Touch was not found!');
			}
		}
		this.updateTouchesState();
	}

	private onMouseLeave(e, callback = noOp) {
		e.preventDefault();
		if (this.state.pointerDown) {
			this.setState({
				pointerDown: false,
			})
			const pos = this.getPositionAsPercentage(e);
			//console.log('left', pos)
			//Stop playing
			callback(pos)
		}
	}

	private getPositionAsPercentage(e): ICoordinates {
		return {
			x: _round(((e.pageX - e.target.offsetLeft) / e.target.offsetWidth) * 100, 2),
			y: _round((100 - ((e.pageY - e.target.offsetTop) / e.target.offsetHeight) * 100), 2),
		}
	}

	private updateTouchesState(){
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

export default MultiTouchView;
