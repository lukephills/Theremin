import * as React from 'react';
import Slider from './Slider';
import { connect } from 'react-redux';

import { DEFAULTS } from '../Constants/Defaults';
import { STYLE, STYLE_CONST } from './Styles/styles';
import {SliderAction} from '../Actions/actions'
import {IGlobalState, ISlider} from '../Constants/GlobalState';

function select(state: IGlobalState): any {
	return {
		slider: state.Slider,
	};
}

@connect(select)
class RangeSliderGroup extends React.Component<any, any> {

	private sliders;

	constructor(props){
		super(props);
		this.sliders = DEFAULTS.Sliders;
	}

	public componentDidMount() {
		// this.setSliderStyles();
	}

	public render(): React.ReactElement<{}> {
		// this.setSliderStyles();
		const sliderHeight = this.props.smallScreen ? STYLE.slider_smallScreen.height : STYLE.slider.height;
		return (
			<div style={STYLE.sliderGroup}>
				<div style={this.getSliderContainerStyles()}>
					<span style={this.getWaveformTitleStyles('delay')}>
						{this.sliders.delay.transformValue(this.props.slider['delay'])}
						{' DELAY'}</span>
					<Slider
						height={sliderHeight}
						width={this.props.windowWidth - (STYLE_CONST.PADDING*2)}
						style={{}}
						sliderColor={this.getSliderColor(0)}
						min={this.sliders.delay.min}
						max={this.sliders.delay.max}
						step={this.sliders.delay.step}
						value={this.props.slider.delay}
						onChange={(value) => this.onSliderChange('delay', value)}
					/>
				</div>
				<div style={this.getSliderContainerStyles()}>
					<span style={this.getWaveformTitleStyles('feedback')}>
						{this.sliders.feedback.transformValue(this.props.slider['feedback'])}
						{' FEEDBACK'}</span>
					<Slider
						height={sliderHeight}
						width={this.props.windowWidth - (STYLE_CONST.PADDING*2)}
						style={{}}
						sliderColor={this.getSliderColor(1)}
						min={this.sliders.feedback.min}
						max={this.sliders.feedback.max}
						step={this.sliders.feedback.step}
						value={this.sliders.feedback.value}
						onChange={(value) => this.onSliderChange('feedback', value)}
					/>
				</div>
				<div style={this.getSliderContainerStyles()}>
					<span style={this.getWaveformTitleStyles('scuzz')}>
						{this.sliders.scuzz.transformValue(this.props.slider['scuzz'])}
						{' SCUZZ'}</span>
					<Slider
						height={sliderHeight}
						width={this.props.windowWidth - (STYLE_CONST.PADDING*2)}
						style={{}}
						sliderColor={this.getSliderColor(2)}
						min={this.sliders.scuzz.min}
						max={this.sliders.scuzz.max}
						step={this.sliders.scuzz.step}
						value={this.sliders.scuzz.value}
						onChange={(value) => this.onSliderChange('scuzz', value)}
					/>
				</div>
			</div>
		);
	}

	private getSliderColor(i: number){
		return `rgba(${STYLE_CONST.GREEN_VALUES},${1-(i*0.2)})`;
	}

	private onSliderChange(slider: string, value: number){
		// console.log(slider, value);
		this.props.sliderChange(slider,value);
		this.props.dispatch(SliderAction(slider, value));
	}

	private getWaveformTitleStyles(slider) {
		const smlFontSize = this.props.windowWidth / 15;
		const fontSize = smlFontSize < STYLE.sliderToolTip.fontSize ? smlFontSize : STYLE.sliderToolTip.fontSize;
		return Object.assign(
			{},
			STYLE.sliderToolTip,
			this.props.smallScreen && STYLE.sliderToolTip_smallScreen,
			{
				marginLeft: this.props[slider.name],
				fontSize,
			}
		);
	}

	private getSliderContainerStyles(){
		return Object.assign(
			{},
			STYLE.sliderContainer,
			this.props.smallScreen && STYLE.sliderContainer_smallScreen
			// {
			// 	display: 'flex',
			// 	flexDirection: 'row-reverse',
			// 	alignItems: 'center',
			// }
		);

	}

	// private setSliderStyles(id) {
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

export default RangeSliderGroup;
