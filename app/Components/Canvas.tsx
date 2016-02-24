import * as React from 'react';
import * as CanvasUtils from '../Utils/CanvasUtils';
import * as ReactDOM from 'react-dom';

interface IProps {
	draw(): void;
	width: number;
	height: number;
	options?: any;
}

interface IState {
}

class Canvas extends React.Component<any, IState> {

	componentDidMount() {
		const {width, height} = this.props;
		const options = this.props.options || {};
		var canvas: HTMLCanvasElement | any = ReactDOM.findDOMNode(this);
		CanvasUtils.canvasResize(canvas, width, height);
		const ctx = canvas.getContext('2d');
		this.props.draw(ctx, width, height, options);
	}

	public render(): React.ReactElement<{}> {
		return (
			<canvas></canvas>
		);
	}


}
export default Canvas;
