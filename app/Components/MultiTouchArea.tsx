import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as CanvasUtils from '../Utils/CanvasUtils';

interface IProps {
	width?: number;
	height?: number;
	style?: any;
	draw?(): any;
	canvas?: HTMLCanvasElement;
	fireMouseLeaveOnElementExit?: boolean;
	onTouchStart?(event: Touch, identifier: number): void;
	onTouchMove?(event: Touch, identifier: number): void;
	onTouchCancel?(event: Touch, identifier: number): void;
	onTouchEnd?(event: Touch, identifier: number): void;
	onMouseDown?(event: MouseEvent, identifier: number): void;
	onMouseMove?(event: MouseEvent, identifier: number): void;
	onMouseUp?(event: MouseEvent, identifier: number): void;
	onMouseLeave?(event: MouseEvent, identifier: number): void;
}

const MOUSE_ID = -999;

class MultiTouchView extends React.Component<IProps, {}> {

	private _pointers;
	private canvasWidth;
	private canvasHeight;

	constructor(props) {
		super(props);
		this._pointers = {}
		this.props = {
			fireMouseLeaveOnElementExit: false,
		};

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.onTouchMove = this.onTouchMove.bind(this);
		this.onTouchCancel = this.onTouchCancel.bind(this);
		this.handleResize = this.handleResize.bind(this);
	}

	componentDidMount() {
		ReactDOM.findDOMNode(this).appendChild(this.props.canvas);
		this.handleResize();
		window.addEventListener('resize', this.handleResize);
	}

	componentWillUnmount() {
		ReactDOM.findDOMNode(this).removeChild(this.props.canvas);
		window.removeEventListener('resize', this.handleResize);
	}

	handleResize() {
		// Resize the canvas element
		CanvasUtils.canvasResize(this.props.canvas, this.props.width, this.props.height);
		this.canvasHeight = this.props.canvas.height;
		this.canvasWidth = this.props.canvas.width;
		if (this.props.draw){
			this.props.draw();
		}
	}

	public render(): React.ReactElement<{}> {
		if (this.props.width !== this.canvasWidth || this.props.height !== this.canvasHeight) {
			this.handleResize();
		}
		return (
			<div
				style={this.getStyles()}
				id="touchArea"
				onTouchStart={this.onTouchStart}
				onTouchEnd={this.onTouchEnd}
				onTouchMove={this.onTouchMove}
				onTouchCancel={this.onTouchCancel}
			    onMouseDown={this.onMouseDown}
			/>
		);
	}

	private getStyles() {
		return Object.assign(
			{
				display: 'inline-block', //TODO: should be in props style instead
				width: this.props.width,
				height: this.props.height,
			},
			this.props.style
		);
	}

	private onMouseDown(e) {
		e.preventDefault();

		// listen for other mouse events
		document.body.addEventListener('mouseup', this.onMouseUp)
		document.body.addEventListener('mousemove', this.onMouseMove)

		this.addMouseLeaveListener();


		// save the pointer
		this._pointers[MOUSE_ID] = true;

		if (this.props.onMouseDown) {
			// console.log('down')
			this.props.onMouseDown(e, MOUSE_ID);
		}
	}

	private onMouseMove(e) {
		e.preventDefault();

		// if this pointer is down
		if (this._pointers[MOUSE_ID]) {
			if (this.props.onMouseMove) {
				this.props.onMouseMove(e, MOUSE_ID);
			}
		}
	}

	private onMouseUp(e) {
		e.preventDefault();
		// if this pointer exists
		if (this._pointers[MOUSE_ID]) {
			if (this.props.onMouseUp){
				this.props.onMouseUp(e, MOUSE_ID);
			}
			delete this._pointers[MOUSE_ID];
		}
		// Remove other mouse event listeners
		document.body.removeEventListener('mouseup', this.onMouseUp)
		document.body.removeEventListener('mousemove', this.onMouseMove)
		this.removeMouseLeaveListener();
	}

	private onMouseLeave(e) {
		if (this.props.onMouseLeave){
			this.props.onMouseLeave(e, MOUSE_ID)
		}
		this.onMouseUp(e);
	}

	private onTouchStart(e: TouchEvent) {
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];
			this._pointers[touch.identifier] = true;
			if (this.props.onTouchStart) {
				this.props.onTouchStart(touch, touch.identifier);
			}
		}
	}

	private onTouchMove(e: TouchEvent) {
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch: any = touches[i];
			const isTouchInBounds: boolean = CanvasUtils.hitTest(touch.clientX, touch.clientY, touch.target.offsetLeft, touch.target.offsetTop, touch.target.clientWidth, touch.target.clientHeight);

			//TODO: we might not want to check if touchmove is in bounds
			if (this._pointers[touch.identifier]) {
			// if (isTouchInBounds && this._pointers[touch.identifier]) {
				if (this.props.onTouchMove) {
					this.props.onTouchMove(touch, touch.identifier);
				}
			}
		}
	}

	private onTouchEnd(e: TouchEvent) {
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];
			if (this.props.onTouchEnd) {
				this.props.onTouchEnd(touch, touch.identifier);
			}
			delete this._pointers[touch.identifier];
		}
	}

	private onTouchCancel(e: TouchEvent) {
		e.preventDefault();
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i];
			if (this.props.onTouchCancel) {
				this.props.onTouchCancel(touch, touch.identifier);
			}
		}
	}

	private addMouseLeaveListener() {
		if (this.props.fireMouseLeaveOnElementExit) {
			// check when mouse leaves element
			ReactDOM.findDOMNode(this).addEventListener('mouseleave', this.onMouseLeave)
		} else {
			// check when mouse leaves body
			document.body.addEventListener('mouseleave', this.onMouseLeave)
		}
	}

	private removeMouseLeaveListener() {
		if (this.props.fireMouseLeaveOnElementExit) {
			// check when mouse leaves element
			ReactDOM.findDOMNode(this).removeEventListener('mouseleave', this.onMouseLeave)
		} else {
			// check when mouse leaves body
			document.body.removeEventListener('mouseleave', this.onMouseLeave)
		}
	}
}

export default MultiTouchView;
