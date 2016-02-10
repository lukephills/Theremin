import * as React from 'react';
import { connect } from 'react-redux';
//import * as ReactSlider from 'react-slider';
const Slider = require('rc-slider');
require('rc-slider/assets/index.css');
require('./Styles/slider-overwrites.css');



interface IProps {
	range?: any;
	value?:any;
	onChange?: any;
}

class RangeSliderGroup extends React.Component<any, {}> {

	public render(): React.ReactElement<{}> {
		const style = {width: 400, margin: 50};
		return (
			<div style={style}>
				<span>Delay</span>
				<Slider
					onChange={() => this.onSliderChange('delay')}
					tipFormatter={null}
				/>
				<span>Feedback</span>
				<Slider
					onChange={() => this.onSliderChange('feedback')}
					tipFormatter={null}
				/>
				<span>Scuzz</span>
				<Slider
					onChange={() => this.onSliderChange('scuzz')}
					tipFormatter={null}
				/>
			</div>
		);
	}

	private onSliderChange(id: string){
		console.log('changed', id );
		switch (id) {
			case 'delay':

				break;
			case 'feedback':

				break;
			case 'scuzz':

			break;
		}
	}

}
export default RangeSliderGroup;
