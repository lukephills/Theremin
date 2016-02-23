//import * as React from 'react';
//
//import MultiTouchView from './MultiTouchView';
//
//interface IProps {
//	width: number;
//	height: number;
//	start(pos, id): void;
//	stop(pos, id): void;
//	move(pos, id): void;
//	canvas?: HTMLCanvasElement;
//}
//
////TODO: REFACTOR!
//
//class TouchAreaContainer extends React.Component<IProps, {}> {
//
//	public render(): React.ReactElement<{}> {
//
//		return (
//			<MultiTouchView
//				width={this.props.width}
//				height={this.props.height}
//				canvas={this.props.canvas}
//			    onDown={this.onDown.bind(this)}
//			    onUp={this.onUp.bind(this)}
//			    onMove={this.onMove.bind(this)}
//			    onLeave={this.onLeave.bind(this)}
//			    onFirstTouch={this.onFirstTouch.bind}
//			/>
//		);
//	}
//
//	private onDown(position, id: number = 0) {
//		this.props.start(position, id);
//	}
//	private onUp(position, id: number = 0) {
//		this.props.stop(position, id);
//	}
//	private onMove(position, id: number = 0) {
//		this.props.move(position, id);
//	}
//	private onLeave(position, id: number = 0) {
//		this.props.move(position, id);
//	}
//}
//
//export default TouchAreaContainer;
