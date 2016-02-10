import * as React from 'react';

interface ICoordinates {
	x: number;
	y: number;
}

interface IProps {
	width: number;
	height: number;
}

interface IState {
	pointerDown: boolean;
}

class TouchArea extends React.Component<IProps, IState> {

	constructor() {
		super();
		this.state = {pointerDown: false}
	}

	public render(): React.ReactElement<{}> {
		const { width, height } = this.props;
		const style = {
			border: '2px solid black',
			background: 'grey',
			cursor: 'pointer',
			width,
			height,
		}
		return (
			<canvas
				style={style}
				id="touchArea"
			    onMouseDown={(e) => this.onPointerDown(e)}
			    onMouseMove={(e) => this.onPointerMove(e)}
			    onMouseUp={(e) => this.onPointerUp(e)}
			    onMouseLeave={(e) => this.onPointerLeave(e)}
			/>
		);
	}

	private onPointerDown(e) {
		this.setState({
			pointerDown: true,
		})
		const pos = this.getPositionAsPercentage(e);
		console.log('down',pos);

		//start playing
	}

	private onPointerMove(e) {
		if (this.state.pointerDown){
			const pos = this.getPositionAsPercentage(e);
			console.log('move',pos);

			//update playing
		}
	}

	private onPointerUp(e) {
		if (this.state.pointerDown){
			this.setState({
				pointerDown: false,
			})
			//stop playing
			const pos = this.getPositionAsPercentage(e);
			console.log('up',pos);
		}
	}

	private onPointerLeave(e) {
		if (this.state.pointerDown) {
			this.setState({
				pointerDown: false,
			})
			const pos = this.getPositionAsPercentage(e);
			console.log('left', pos)
			//Stop playing
		}
	}

	private getPositionAsPercentage(e): ICoordinates {
		return {
			x: ((e.pageX - e.target.offsetLeft) / e.target.offsetWidth) * 100,
			y: (100 - ((e.pageY - e.target.offsetTop) / e.target.offsetHeight) * 100),
		}
	}
}

export default TouchArea;
