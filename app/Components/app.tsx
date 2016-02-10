import * as React from 'react';
import { connect } from 'react-redux';
require("normalize.css");

import RecordPlayButtonGroup from './RecordPlayButtonGroup';
import NoteGuideButton from './NoteGuideButton';
import WaveformSelectGroup from './WaveformSelectGroup';
import RangeSliderGroup from './RangeSliderGroup';
import TouchArea from './TouchArea';

interface IState {
	windowHeight: number;
	windowWidth: number;
}

function select(state, props) {
	return {
		name: state.name
	};
}

@connect(select)
class App extends React.Component<any, IState> {

	constructor() {
		super();
		this.state = {
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight,
		};
	}

	public componentDidMount() {
		window.addEventListener('resize', this.handleResize.bind(this));
	}

	public componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize.bind(this));
	}

	public render(): React.ReactElement<{}> {
		return (
			<div id='body-wrapper'>
				<h1>Theremin</h1>
				<RecordPlayButtonGroup />
				<NoteGuideButton />
				<WaveformSelectGroup />
				<TouchArea
					width={this.state.windowWidth}
					height={this.state.windowHeight - 300}
				/>
				<RangeSliderGroup />
			</div>
		);
	}

	private handleResize() {
		this.setState({
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight,
		});
	}
}
export default App;
