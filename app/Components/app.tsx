import * as React from 'react';
import { connect } from 'react-redux';

import RecordPlayButtonGroup from './RecordPlayButtonGroup';
import NoteGridButton from './NoteGridButton';
import WaveformSelectGroup from './WaveformSelectGroup';
import RangeSliderGroup from './RangeSliderGroup';

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
				<NoteGridButton />
				<WaveformSelectGroup />
				<canvas id="touchArea"/>
				<RangeSliderGroup />
			</div>
		);
	}
}
export default App;
