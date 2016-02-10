import * as React from 'react';
import { connect } from 'react-redux';

import RecordPlayButtonGroup from './RecordPlayButtonGroup';
import NoteGuideButton from './NoteGuideButton';
import WaveformSelectGroup from './WaveformSelectGroup';
import RangeSliderGroup from './RangeSliderGroup';
import TouchArea from './TouchArea';

function select(state, props) {
	return {
		name: state.name
	};
}

@connect(select)
class App extends React.Component<any, {}> {
	public render(): React.ReactElement<{}> {

		return (
			<div id='body-wrapper'>
				<h1>Theremin</h1>
				<RecordPlayButtonGroup />
				<NoteGuideButton />
				<WaveformSelectGroup />
				<TouchArea />
				<RangeSliderGroup />
			</div>
		);
	}
}
export default App;
