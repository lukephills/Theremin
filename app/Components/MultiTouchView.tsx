import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import * as CanvasUtils from '../Utils/CanvasUtils';
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
			    onTouchCancel={(e) => this.onTouchCancel(e, onLeave)}
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
			e.preventDefault();
			callback(e);
		}
	}

	private onMouseUp(e, callback = noOp) {
		e.preventDefault();
		this.setState({
			pointerDown: false,
		});
		callback(e);
	}

	private onTouchStart(e: TouchEvent, callback = noOp) {
		console.log('touchstart')
		e.preventDefault();
		//const touches = e.changedTouches;
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];
			console.log('starting touch', touch.identifier);
			callback(touch, touch.identifier);
		}
	}


	private onTouchMove(e: TouchEvent, callback = noOp) {
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch: any = touches[i];
			const isTouchInBounds: boolean = CanvasUtils.hitTest(touch.clientX, touch.clientY, touch.target.offsetLeft, touch.target.offsetTop, touch.target.clientWidth, touch.target.clientHeight);
			if (isTouchInBounds) {
				console.log('moving touch', touch.identifier);
				callback(touch, touch.identifier)
			} else {
				this.touchLeft(e);
			}

		}

	}

	private onTouchEnd(e: TouchEvent, callback = noOp) {
		if (this.hasBeenTouched === false)	{
			// play empty buffer to unmute audio (ios needs this)
			this.props.onFirstTouch();
			this.hasBeenTouched = true;
		}
		console.log('touch end');
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];
			console.log('ending touch', touch.identifier);
			callback(touch, touch.identifier)
		}
	}

	private onTouchCancel(e: TouchEvent, callback = noOp) {
		console.log('touch cancelled')
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];
			console.log('cancelling touch', touch.identifier);
			callback(touch, touch.identifier)
		}
	}

	private touchLeft(e) {
		//TODO: not needed
		console.log('touch left');
	}
}

export default MultiTouchView;
