import * as React from 'react';
import { connect } from 'react-redux';
import {Defaults, WAVEFORMS} from '../Constants/Defaults'
import ToggleButton from './ToggleButton';

interface IProps {
	//selected?: boolean;
}

interface IState {
	waveform: string;
}

class WaveformSelectGroup extends React.Component<IProps, IState> {

	constructor() {
		super();
		this.state = {
			waveform: WAVEFORMS[Defaults.Waveform],
		}
	}

	public render(): React.ReactElement<{}> {

		return (
			<div>
				{WAVEFORMS.map((waveform: string, id: number) => {
					return (
						<ToggleButton
							id={waveform}
							isOn={waveform === this.state.waveform}
							onClick={() => this.onButtonClick(waveform)}
							key={id}
						>
							{waveform}
						</ToggleButton>
					);
				})}
			</div>
		);
	}

	private onButtonClick(waveform: string) {
		console.log(waveform);
		//Set button with the corresponding id's isOn prop to true

		//Set all others isOn prop to false
		this.setState({waveform})
	}
}
export default WaveformSelectGroup;
