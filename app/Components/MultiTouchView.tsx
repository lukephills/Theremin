import * as React from 'react';
import * as ReactDOM from 'react-dom';
const _round = require('lodash/round');
import { connect } from 'react-redux';

import { IGlobalState } from '../Constants/GlobalState';
import { noOp } from '../Utils/utils';
import { style } from './Styles/styles';
import TouchEvent = __React.TouchEvent;

export interface ICoordinates {
	x: number;
	y: number;
}

interface IProps {
	width: number;
	height: number;
	canvas: HTMLCanvasElement;
	onDown(pos: ICoordinates, identifier: number): void;
	onMove(pos: ICoordinates, identifier: number): void;
	onUp(pos: ICoordinates, identifier: number): void;
	onLeave(pos: ICoordinates, identifier: number): void;
	onFirstTouch(): void;
}

interface IState {
	pointerDown?: boolean;
	touches?: any; //Touch.identifiers
}

interface ITouch {
	identifier: number;
	x: number;
	y: number;
}

class MultiTouchView extends React.Component<IProps, IState> {

	private currentTouches: ITouch[];
	hasFirstTouch: boolean = false;

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
				width={this.props.width}
				height={this.props.height}
			    onMouseDown={(e) => this.onMouseDown(e, onDown)}
				onMouseUp={(e) => this.onMouseUp(e, onUp)}
				onMouseMove={(e) => this.onMouseMove(e, onMove)}
				onMouseLeave={(e) => this.onMouseUp(e, onLeave)}
			    onTouchStart={(e) => this.onTouchStart(e, onDown)}
				onTouchEnd={(e) => this.onTouchEnd(e, onUp)}
			    onTouchMove={(e) => this.onTouchMove(e, onMove)}
			    onTouchCancel={(e) => this.onTouchEnd(e, onLeave)}
			/>
		);
	}

	private getStyles() {
		return Object.assign(
			{
				display: 'inline-block'
			},
			style.touchArea
		);
	}

	private onMouseDown(e, callback = noOp) {
		console.log('mousedown')
		e.preventDefault();
		this.setState({
			pointerDown: true,
		})
		const pos: ICoordinates = this.getPositionAsPercentage(e);
		callback(pos);
	}

	private onMouseMove(e, callback = noOp) {
		//only do something if we have pointers down
		if (this.state.pointerDown || (this.state.touches && this.state.touches.length)){
			const pos: ICoordinates = this.getPositionAsPercentage(e);
			callback(pos);
		}
	}

	private onMouseUp(e, callback = noOp) {
		e.preventDefault();
		this.setState({
			pointerDown: false,
		})
		const pos: ICoordinates = this.getPositionAsPercentage(e);
		callback(pos);
	}


	copyTouch(touch: Touch, pos: ICoordinates) {
		//return { id: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
		//TODO: copyTouch shouldn't care about touch positions as a percentage. It should just copy pageX and pageY

		return { identifier: touch.identifier, x: pos.x, y: pos.y };
	}

	private onTouchStart(e: TouchEvent, callback = noOp) {
		console.log('touchstart')
		e.preventDefault();
		//const touches = e.changedTouches;
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];

			//TODO: remove this:
			const pos: ICoordinates = this.getPositionAsPercentage(touch);

			//Add this touch to list of touches
			this.currentTouches.push(this.copyTouch(touch, pos));

			console.log('starting touch', touch.identifier);
			callback(pos, touch.identifier);
		}
		this.updateTouchesState();
	}


	private onTouchMove(e: TouchEvent, callback = noOp) {
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];
			const pos: ICoordinates = this.getPositionAsPercentage(touch); //TODO: remove

			const idx = this.getCurrentTouchIndexById(touch.identifier);

			if (idx >= 0){
				console.log('moving touch', touch.identifier);
				const currentTouch = this.currentTouches[idx];

				// Update the touch record.
				currentTouch.x = pos.x;
				currentTouch.y = pos.y;

				// Update this touches pitch
				callback(pos, touch.identifier)

				// Store the record.
				this.currentTouches.splice(idx, 1, this.copyTouch(touch, pos));
			} else {
				console.log(`no touch to continue found`);
			}
		}
		this.updateTouchesState();
	}

	private onTouchEnd(e: TouchEvent, callback = noOp) {
		if (!this.hasFirstTouch)	{
			// play empty buffer to unmute audio
			this.props.onFirstTouch();
			this.hasFirstTouch = true;
		}
		console.log('touch end')
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];
			const pos: ICoordinates = this.getPositionAsPercentage(touch); // TODO: Remove

			const idx = this.getCurrentTouchIndexById(touch.identifier);

			if (idx >= 0) {
				console.log('ending touch', touch.identifier);
				callback(pos, touch.identifier)
				this.currentTouches.splice(idx, 1); // Remove it, touch ended
			} else {
				console.log('No touch to end found');
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

	private getCurrentTouchIndexById(identifier: number) {
		for (let i = 0; i < this.currentTouches.length; i++) {
			if (this.currentTouches[i].identifier === identifier) {
				//return this.currentTouches[i].index;
				return i;
			}
		}
		return -1; // Not found
	}
}

export default MultiTouchView;
