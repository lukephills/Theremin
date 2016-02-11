import * as React from 'react';
const Slider = require('rc-slider');
import { connect } from 'react-redux';
//require('rc-slider/assets/index.css');
require('./Styles/slider.css');

import { Defaults } from '../Constants/Defaults';
import { style } from './Styles/styles';
import {SliderAction} from '../Actions/actions'
import {IGlobalState} from '../Constants/GlobalState';



function select(state: IGlobalState): any {
	return {
		slider: state.Slider,
	};
}

@connect(select)
class RangeSliderGroup extends React.Component<any, any> {

	public componentDidMount() {
		this.setSliderStyles();
	}

	public render(): React.ReactElement<{}> {
		return (
			<div style={style.sliderGroup}>
				{Defaults.Sliders.map((slider: any, id: number) => {
					return (
						<div key={id} style={this.getSliderStyles()}>
							<span style={this.getWaveformTitleStyles(slider)}>
								{slider.name.toUpperCase()} - {this.props[slider.name]}
							</span>
							<Slider
								min={slider.min}
								max={slider.max}
								value={this.props.slider[slider.name]}
								onChange={(value) => this.onSliderChange(slider.name, value)}
								tipFormatter={null}
							/>
						</div>
					)
				})}
			</div>
		);
	}

	private onSliderChange(slider: string, value: number){
		this.props.dispatch(SliderAction(slider, value));
	}

	private getWaveformTitleStyles(slider) {
		return Object.assign(
			{},
			style.sliderToolTip,
			{
				marginLeft: this.props[slider.name]
			}
		);
	}

	private getSliderStyles(){
		return Object.assign(
			{},
			style.sliderContainer,
			{
				display: 'flex',
				flexDirection: 'row-reverse',
				alignItems: 'center',
			}
		);

	}

	private setSliderStyles() {
		const sliders: any = document.querySelectorAll('.rc-slider');
		for (var i = 0; i < sliders.length; i++) {
			sliders[i].style.height = `${style.slider.height}px`;
		}

		const sliderTracks: any = document.querySelectorAll('.rc-slider-track');
		for (var i = 0; i < sliderTracks.length; i++) {
			sliderTracks[i].style.height = `${style.slider.height}px`;
		}
		console.log('sliders style set')
	}

}

export default RangeSliderGroup;
