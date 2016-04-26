import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactDOM from 'react-dom';
import { DEFAULTS } from '../Constants/Defaults';
import { STYLE_CONST } from './Styles/styles';

import {IGlobalState} from '../Constants/GlobalState';
import MultiTouchArea from './MultiTouchArea';
import * as CanvasUtils from '../Utils/CanvasUtils';

interface IProps {
	height: number;
	width: number;
	style: any;
	sliderColor: string;
	min: number;
	max: number;
	step: number;
	value: number;
	onChange(value): any;
}

function select(state: IGlobalState): any {
	return {
		slider: state.Slider,
	};
}

@connect(select)
class Slider extends React.Component<IProps, any> {

	private sliders: any;
	private canvas
	private _pixelRatio;
	private value: number;
	private domNode;

	constructor(props){
		super(props);
		this.sliders = DEFAULTS.Sliders;
		//Create canvas with the device resolution.
		this.canvas = CanvasUtils.createCanvas(this.props.width, this.props.height);
		this._pixelRatio = CanvasUtils.getPixelRatio();
		this.value = CanvasUtils.getPercentageBetweenRange(this.props.value, this.props.min, this.props.max);
		
		this.onDown = this.onDown.bind(this);
		this.onUp = this.onUp.bind(this);
		this.onMove = this.onMove.bind(this);
		this.DrawOnce = this.DrawOnce.bind(this)
	}

	public componentDidMount() {
		this.DrawOnce();
		this.domNode = ReactDOM.findDOMNode(this);
	}

	public render(): React.ReactElement<{}> {
		// console.log('render')
		
		return (
			<MultiTouchArea
				canvas={this.canvas}
				width={this.props.width}
				height={this.props.height}
				onMouseDown={this.onDown}
				onTouchStart={this.onDown}
				onMouseUp={this.onUp}
				onTouchEnd={this.onUp}
				onMouseMove={this.onMove}
				onTouchMove={this.onMove}
			    style={this.props.style}
			    draw={this.DrawOnce}
				fireMouseLeaveOnElementExit={false}
			/>
		);
	}

	private DrawOnce() {
		const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
		const width: number = this.canvas.width / this._pixelRatio;
		const height: number = this.canvas.height / this._pixelRatio;
		const cy = height/2;
		const sliderLength = (width/100) * this.value;

		// Clear everything
		ctx.clearRect(0, 0, width, height);

		// Slider bar
		ctx.fillStyle = this.props.sliderColor;
		ctx.fillRect(0, 0, sliderLength, height);

		// Diamond
		const diamondSize = 4;
		ctx.moveTo(sliderLength, height/2);
		ctx.beginPath();
		ctx.fillStyle = STYLE_CONST.BLACK;
		ctx.moveTo(sliderLength, cy + diamondSize)
		ctx.lineTo(sliderLength + diamondSize, cy);
		ctx.lineTo(sliderLength, cy - diamondSize);
		ctx.lineTo(sliderLength - diamondSize, cy);
		ctx.closePath();
		ctx.fill();
	}

	//TODO: add slider step functionality
	private calculateStep(x: number) {
		let step = this.props.step ? this.props.step : 0;
		x = Math.ceil(x / step) * step;
		return x;
	}

	onDown(e, id){
		const pos = CanvasUtils.getCoordinateFromEventAsPercentageWithinElement(e, this.domNode as HTMLElement);
		this.value = pos.x;
		this.DrawOnce();
		this.props.onChange(CanvasUtils.getValueFromPercentageRange(pos.x, this.props.min, this.props.max));
	}

	onUp(e, id){
		const pos = CanvasUtils.getCoordinateFromEventAsPercentageWithinElement(e, this.domNode as HTMLElement);
		this.value = pos.x;
		this.DrawOnce();
		this.props.onChange(CanvasUtils.getValueFromPercentageRange(pos.x, this.props.min, this.props.max));
	}

	onMove(e, id){
		const pos = CanvasUtils.getCoordinateFromEventAsPercentageWithinElement(e, this.domNode as HTMLElement);
		this.value = pos.x;
		this.DrawOnce();
		this.props.onChange(CanvasUtils.getValueFromPercentageRange(pos.x, this.props.min, this.props.max));
	}

	// private getWaveformTitleStyles(slider) {
	// 	const smlFontSize = this.props.windowWidth / 15;
	// 	const fontSize = smlFontSize < STYLE.sliderToolTip.fontSize ? smlFontSize : STYLE.sliderToolTip.fontSize;
	// 	return Object.assign(
	// 		{},
	// 		STYLE.sliderToolTip,
	// 		this.props.smallScreen && STYLE.sliderToolTip_smallScreen,
	// 		{
	// 			marginLeft: this.props[slider.name],
	// 			fontSize,
	// 		}
	// 	);
	// }


}

export default Slider;
