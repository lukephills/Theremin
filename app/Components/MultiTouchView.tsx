import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { IGlobalState } from '../Constants/GlobalState';
import { noOp } from '../Utils/utils';
import { style } from './Styles/styles';
import TouchEvent = __React.TouchEvent;

interface IProps {
	width: number;
	height: number;
	canvas: HTMLCanvasElement;
	onDown(event: Event, identifier: number): void;
	onMove(event: Event, identifier: number): void;
	onUp(event: Event, identifier: number): void;
	onLeave(event: Event, identifier: number): void;
	onFirstTouch(): void;
}

interface IState {
	pointerDown?: boolean;
	//touches?: any; //Touch.identifiers
}

interface ITouch {
	identifier: number;
	x: number;
	y: number;
}

class MultiTouchView extends React.Component<IProps, IState> {

	//private currentTouches: ITouch[];
	private hasBeenTouched: boolean = false;

	constructor() {
		super();
		this.state = {pointerDown: false}
		//this.currentTouches = [];
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
				display: 'inline-block',
				width: this.props.width,
				height: this.props.height,
			},
			style.touchArea
		);
	}

	private onMouseDown(e, callback = noOp) {
		console.log('mousedown');
		e.preventDefault();
		this.setState({
			pointerDown: true,
		})

		callback(e);
	}

	private onMouseMove(e, callback = noOp) {
		//only do something if we have pointers down
		if (this.state.pointerDown){
			//const pos: ICoordinates = this.getPositionAsPercentage(e);
			e.preventDefault();
			callback(e);
		}
	}

	private onMouseUp(e, callback = noOp) {
		e.preventDefault();
		this.setState({
			pointerDown: false,
		})
		//const pos: ICoordinates = this.getPositionAsPercentage(e);
		callback(e);
	}


	//copyTouch(touch: Touch, pos: ICoordinates) {
	//	//return { id: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
	//	//TODO: copyTouch shouldn't care about touch positions as a percentage. It should just copy pageX and pageY
	//
	//	return { identifier: touch.identifier, x: pos.x, y: pos.y };
	//}

	private onTouchStart(e: TouchEvent, callback = noOp) {
		console.log('touchstart')
		e.preventDefault();
		//const touches = e.changedTouches;
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];

			//TODO: remove this:
			//const pos: ICoordinates = this.getPositionAsPercentage(touch);

			//Add this touch to list of touches
			//this.currentTouches.push(this.copyTouch(touch, pos));

			console.log('starting touch', touch.identifier);
			callback(touch, touch.identifier);
		}
	}


	private onTouchMove(e: TouchEvent, callback = noOp) {
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];
			//const pos: ICoordinates = this.getPositionAsPercentage(touch); //TODO: remove

			//const idx = this.getCurrentTouchIndexById(touch.identifier);

			//if (idx >= 0){
			console.log('moving touch', touch.identifier);
			//const currentTouch = this.currentTouches[idx];

			// Update the touch record.
			//currentTouch.x = pos.x;
			//currentTouch.y = pos.y;

			// Update this touches pitch
			callback(touch, touch.identifier)

			// Store the record.
			//this.currentTouches.splice(idx, 1, this.copyTouch(touch, pos));
			//} else {
			//	console.log(`no touch to continue found`);
			//}
		}

	}

	private onTouchEnd(e: TouchEvent, callback = noOp) {
		if (this.hasBeenTouched === false)	{
			// play empty buffer to unmute audio (ios needs this)
			this.props.onFirstTouch();
			this.hasBeenTouched = true;
		}
		console.log('touch end')
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];
			//const pos: ICoordinates = this.getPositionAsPercentage(touch); // TODO: Remove

			//const idx = this.getCurrentTouchIndexById(touch.identifier);

			//if (idx >= 0) {
				console.log('ending touch', touch.identifier);
				callback(touch, touch.identifier)
				//this.currentTouches.splice(idx, 1); // Remove it, touch ended
			//} else {
			//	console.log('No touch to end found');
			//}
		}
	}
}

export default MultiTouchView;
