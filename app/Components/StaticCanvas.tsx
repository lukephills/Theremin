import * as React from 'react';
import * as CanvasUtils from '../Utils/CanvasUtils';
import * as ReactDOM from 'react-dom';

/**
 * Canvas element that redraws on new props only
 */
class StaticCanvas extends React.Component<any, any> {

	canvas: any;

	componentDidMount() {
		this.drawOnce();
	}

	componentWillReceiveProps() {
		this.drawOnce();
	}

	public render(): React.ReactElement<{}> {
		return (
			<canvas></canvas>
		);
	}

	drawOnce(){
		const {width, height} = this.props;
		const options = this.props.options || {};
		var canvas: HTMLCanvasElement | any = this.canvas || ReactDOM.findDOMNode(this);
		CanvasUtils.canvasResize(canvas, width, height);
		const ctx = canvas.getContext('2d');
		this.props.draw(ctx, width, height, options);
	}


}
export default StaticCanvas;
