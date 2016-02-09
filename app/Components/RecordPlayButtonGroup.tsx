import * as React from 'react';
import { connect } from 'react-redux';
import ToggleButton from './ToggleButton';

interface IRecordPlayButtonGroupProps {
}

class RecordPlayButtonGroup extends React.Component<IRecordPlayButtonGroupProps, {}> {

	public render(): React.ReactElement<{}> {

		return (
			<section>
				<span>Record:</span>
				<ToggleButton />

				<span>Play:</span>
				<ToggleButton />
			</section>
		);
	}
}
export default RecordPlayButtonGroup;
