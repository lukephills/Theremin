import * as React from 'react';
import { connect } from 'react-redux';
import ToggleButton from './ToggleButton';

interface IWaveformSelectGroupProps {
}

class WaveformSelectGroup extends React.Component<IWaveformSelectGroupProps, {}> {

	public render(): React.ReactElement<{}> {

		return (
			<div>
				<ToggleButton />
			</div>
		);
	}
}
export default WaveformSelectGroup;
