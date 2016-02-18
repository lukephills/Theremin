import * as React from 'react';
import * as ReactDOM from 'react-dom';
const _round = require('lodash/round');
import { connect } from 'react-redux';

import { IGlobalState } from '../Constants/GlobalState';
import { noOp } from '../Utils/utils';
import { style } from './Styles/styles';

export interface ICoordinates {
	x: number;
	y: number;
}

interface IProps {
	width: number;
	height: number;
	canvas?: HTMLCanvasElement;
	onDown?: () => any;
	onMove?: () => any;
	onUp?: () => any;
	onLeave?: () => any;
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

class MultiTouchView extends React.Component<IProps, IState> {

	private currentTouches: ITouch[];

	constructor() {
		super();
		this.state = {pointerDown: false}
		this.currentTouches = [];
	}

	componentDidMount() {
		ReactDOM.findDOMNode(this).appendChild(this.props.canvas);
	}

	componentWillUnmount() {
		ReactDOM.findDOMNode(this).removeChild(this.props.canvas);
	}

	public render(): React.ReactElement<{}> {
		const {
			onDown,
			onMove,
			onUp,
			onLeave,
			} = this.props
		return (
			<div
				style={this.getStyles()}
				id="touchArea"
			    onMouseDown={(e) => this.onMouseDown(e, onDown)}
				onMouseUp={(e) => this.onMouseUp(e, onUp)}
				onMouseMove={(e) => this.onMouseMove(e, onMove)}
				onMouseLeave={(e) => this.onMouseLeave(e, onLeave)}
			    onTouchStart={(e) => this.onTouchStart(e, onDown)}
				onTouchEnd={(e) => this.onTouchEnd(e, onUp)}
			    onTouchMove={(e) => this.onTouchMove(e, onMove)}
			    onTouchCancel={(e) => this.onTouchEnd(e, onLeave)}
			/>
		);
	}

	private getStyles() {
		const { width, height } = this.props;
		return Object.assign(
			{
				display: 'inline-block'
			},
			style.touchArea,
			{
				width,
				height,
			}
		);
	}

	private onMouseDown(e, callback = noOp) {
		e.preventDefault();
		this.setState({
			pointerDown: true,
		})
		const pos: ICoordinates = this.getPositionAsPercentage(e);
		callback(pos);
	}

	private onTouchStart(e, callback = noOp) {
		e.preventDefault();
		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i];
			const pos: ICoordinates = this.getPositionAsPercentage(touch);

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
			const pos: ICoordinates = this.getPositionAsPercentage(e);
			callback(pos);
		}
	}

	private onTouchMove(e, callback = noOp) {
		e.preventDefault();
		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i];
			const pos: ICoordinates = this.getPositionAsPercentage(touch);
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
		const pos: ICoordinates = this.getPositionAsPercentage(e);
		callback(pos);
	}

	private onTouchEnd(e, callback = noOp) {
		e.preventDefault();
		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i];
			const pos: ICoordinates = this.getPositionAsPercentage(touch);
			const currentTouchIndex = this.getCurrentTouchIndex(touch.identifier);

			if (currentTouchIndex >= 0) {
				const currentTouch = this.currentTouches[currentTouchIndex];
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
			const pos: ICoordinates = this.getPositionAsPercentage(e);
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
		for (let i = 0; i < this.currentTouches.length; i++) {
			if (this.currentTouches[i].id === id) {
				return i;
			}
		}
		// Touch not found! Return -1.
		return -1;
	}
}

export default MultiTouchView;
