import * as React from 'react';
import * as CanvasUtils from '../Utils/CanvasUtils';
import * as ReactDOM from 'react-dom';

/**
 * Canvas element that redraws on new props only
 */
class StaticCanvas extends React.Component<any, any> {

	private canvas: HTMLCanvasElement | any;

	public componentDidMount(): void {
		this.drawOnce();
	}

	public componentWillReceiveProps(): void {
		this.drawOnce();
	}

	public render(): React.ReactElement<{}> {
		return (
			<canvas></canvas>
		);
	}

	private drawOnce(): void {
		const {width, height} = this.props;
		const options: any = this.props.options || {};
		const canvas: HTMLCanvasElement | any = this.canvas || ReactDOM.findDOMNode(this);
		CanvasUtils.canvasResize(canvas, width, height);
		const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
		this.props.draw(ctx, width, height, options);
	}
}
export default StaticCanvas;
