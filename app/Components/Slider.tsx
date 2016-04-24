import * as React from 'react';
import { connect } from 'react-redux';

import { DEFAULTS } from '../Constants/Defaults';
import { STYLE, STYLE_CONST } from './Styles/styles';

import {IGlobalState} from '../Constants/GlobalState';
import MultiTouchView from './MultiTouchView2';
import * as CanvasUtils from '../Utils/CanvasUtils';

const LodashRound = require('lodash/round');

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
	

	constructor(props){
		super(props);
		this.sliders = DEFAULTS.Sliders;
		//Create canvas with the device resolution.
		this.canvas = CanvasUtils.createCanvas(this.props.width, this.props.height);
		this._pixelRatio = CanvasUtils.getPixelRatio();
		this.value = this.GetPercentageBetweenRange(this.props.value, this.props.max, this.props.min);
		
		this.onDown = this.onDown.bind(this);
		this.onUp = this.onUp.bind(this);
		this.onMove = this.onMove.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.DrawOnce = this.DrawOnce.bind(this)
	}

	public componentDidMount() {
		this.DrawOnce();
		window.addEventListener('resize', this.handleResize);
	}

	public componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	handleResize(){
		// // Resize the canvas element
		// CanvasUtils.canvasResize(this.canvas, this.props.width, this.props.height);
	}

	public render(): React.ReactElement<{}> {
		this.DrawOnce();
		
		return (
			<MultiTouchView
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

	//TODO: add step functionality
	private calculateStep(x: number) {
		let step = this.props.step ? this.props.step : 0;
		x = Math.ceil(x / step) * step;
		return x;
	}

	//TODO: add to utils
	GetPercentageBetweenRange(x: number, max: number, min: number){
		return (100 * x)/(max - min);
	}

	//TODO: add to utils
	GetValFromPercentageRange(x: number, max: number, min: number) {
		return ((max - min)/100) * x;
	}

	onDown(e, id){
		const pos: CanvasUtils.ICoordinates = CanvasUtils.getPercentagePosition(e);
		this.value = pos.x;
		this.DrawOnce();
		this.props.onChange(this.GetValFromPercentageRange(pos.x, this.props.max, this.props.min));
	}

	onUp(e, id){
		console.log(e.offsetX);
		//TODO: NEED TO USE e.offsetX to get value from position
		const pos: CanvasUtils.ICoordinates = CanvasUtils.getPercentagePosition(e);
		this.value = pos.x;
		this.DrawOnce();
		this.props.onChange(this.GetValFromPercentageRange(pos.x, this.props.max, this.props.min));
	}

	onMove(e, id){
		const pos: CanvasUtils.ICoordinates = CanvasUtils.getPercentagePosition(e);
		this.value = pos.x;
		this.DrawOnce();
		this.props.onChange(this.GetValFromPercentageRange(pos.x, this.props.max, this.props.min));
	}


	// private onSliderChange(slider: string, value: number){
	// 	this.props.sliderChange(slider,value);
	// 	this.props.dispatch(SliderAction(slider, value));
	// }

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

	// private getSliderStyles(){
	// 	return Object.assign(
	// 		{},
	// 		STYLE.sliderContainer,
	// 		this.props.smallScreen && STYLE.sliderContainer_smallScreen,
	// 		{
	// 			display: 'flex',
	// 			flexDirection: 'row-reverse',
	// 			alignItems: 'center',
	// 		}
	// 	);
	//
	// }

	// private setSliderStyles() {
	// 	const height = this.props.smallScreen ? STYLE.slider_smallScreen.height : STYLE.slider.height;
	// 	const sliders: any = document.querySelectorAll('.rc-slider');
	// 	for (var i = 0; i < sliders.length; i++) {
	// 		sliders[i].style.height = `${height}px`;
	// 		sliders[i].style.backgroundColor = STYLE_CONST.WHITE;
	// 	}
	// 	const sliderTracks: any = document.querySelectorAll('.rc-slider-track');
	// 	for (var i = 0; i < sliderTracks.length; i++) {
	// 		sliderTracks[i].style.backgroundColor = `rgba(${STYLE_CONST.GREEN_VALUES},${1-(i*0.2)})`;
	// 		sliderTracks[i].style.height = `${height}px`;
	// 	}
	// }
}

export default Slider;
