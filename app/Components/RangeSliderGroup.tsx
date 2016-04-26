import * as React from 'react';
import Slider from './Slider';
import SliderToolTip from './SliderToolTip';


import { DEFAULTS } from '../Constants/Defaults';
import { STYLE, STYLE_CONST } from './Styles/styles';

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
		);
	}
}

export default RangeSliderGroup;
