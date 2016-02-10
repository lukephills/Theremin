import * as React from 'react';
const Slider = require('rc-slider');
//require('rc-slider/assets/index.css');
require('./Styles/slider.css');

import { Defaults } from '../Constants/Defaults';

class RangeSliderGroup extends React.Component<any, any> {

	constructor() {
		super();

		// Set the original state dynamically based on Defaults.Sliders
		let originalState = {};
		for (let i = 0; i < Defaults.Sliders.length; i++ ){
			const slider = Defaults.Sliders[i];
			originalState = Object.assign(
				originalState,
				{
					[slider.name]: slider.value
				}
			);
		}
		this.state = originalState;
	}

	public render(): React.ReactElement<{}> {
		return (
			<div>
				{Defaults.Sliders.map((slider: any, id: number) => {
					return (
						<div>
							<span>{slider.name}</span>
							<Slider
								key={id}
								min={slider.min}
								max={slider.max}
								value={this.state[slider.name]}
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
		console.log('changed', slider, value);
		this.setState({
			[slider]: value
		});
	}
}

export default RangeSliderGroup;
