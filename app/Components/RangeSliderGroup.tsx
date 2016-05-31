import * as React from 'react';
import Slider from './Slider';
import SliderToolTip from './SliderToolTip';


import { DEFAULTS } from '../Constants/Defaults';
import { STYLE, STYLE_CONST } from './Styles/styles';
import { SCREEN } from '../Constants/AppTypings';

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
		const screenHeightGroup = this.props.screenHeightGroup;
		let sliderHeight = STYLE.slider.height;
		if (screenHeightGroup === SCREEN.MOBILE_LANDSCAPE || screenHeightGroup === SCREEN.MOBILE) {
			sliderHeight = STYLE.slider_small.height;
		} else if (screenHeightGroup === SCREEN.LARGE) {
			sliderHeight = STYLE.slider_large.height;
		}

		return (
			<div style={STYLE.sliderGroup}>
				<div style={this.getSliderContainerStyles()}>
					<SliderToolTip
						id="sliderTooltip-delay"
						style={this.getWaveformTitleStyles('delay')}
					    text="DELAY"
					    value={this.sliders.delay.transformValue(this.sliders.delay.value)}
					/>
					<Slider
						height={sliderHeight}
						width={this.props.windowWidth - (STYLE_CONST.PADDING*2)}
						style={{}}
						sliderColor={this.getSliderColor(0)}
						min={this.sliders.delay.min}
						max={this.sliders.delay.max}
						step={this.sliders.delay.step}
						value={this.sliders.delay.value}
						onChange={(value) => this.onSliderChange('delay', value)}
					/>
				</div>
				<div style={this.getSliderContainerStyles()}>
					<SliderToolTip
						id="sliderTooltip-feedback"
						style={this.getWaveformTitleStyles('feedback')}
						text="FEEDBACK"
						value={this.sliders.feedback.transformValue(this.sliders.feedback.value)}
					/>
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
					<SliderToolTip
						id="sliderTooltip-scuzz"
						style={this.getWaveformTitleStyles('scuzz')}
						text="SCUZZ"
						value={this.sliders.scuzz.transformValue(this.sliders.scuzz.value)}
					/>
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
		this.props.sliderChange(slider,value);

		//TODO: I'm setting the sliderToolTip directly to stop the slider canvases from
		// rerendering when they don't need to. Find a better way to do this.
		document.getElementById('sliderTooltip-'+slider).innerHTML =
			this.sliders[slider].transformValue(value) + ' ' + slider.toUpperCase();
		// this.props.dispatch(SliderAction(slider, value))
	}

	private getWaveformTitleStyles(slider) {
		const screenHeightGroup = this.props.screenHeightGroup;
		const smlFontSize = this.props.windowWidth / 15;
		const fontSize = smlFontSize < STYLE.sliderToolTip.fontSize ? smlFontSize : STYLE.sliderToolTip.fontSize;
		console.log(screenHeightGroup);
		return Object.assign(
			{},
			STYLE.sliderToolTip,
			{
				marginLeft: this.props[slider.name],
				fontSize,
			},
			(screenHeightGroup === SCREEN.MOBILE ||
			screenHeightGroup === SCREEN.MOBILE_LANDSCAPE) && STYLE.sliderToolTip_small,
			(screenHeightGroup === SCREEN.LARGE) && STYLE.sliderToolTip_large
		);
	}

	private getSliderContainerStyles(){
		const screenHeightGroup = this.props.screenHeightGroup;
		return Object.assign(
			{},
			STYLE.sliderContainer,
			(screenHeightGroup === SCREEN.MOBILE ||
			screenHeightGroup === SCREEN.MOBILE_LANDSCAPE) && STYLE.sliderContainer_small,
			(screenHeightGroup === SCREEN.LARGE) && STYLE.sliderContainer_large
		);
	}
}

export default RangeSliderGroup;
