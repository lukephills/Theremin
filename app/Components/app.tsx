import * as React from 'react';
import { connect } from 'react-redux';
require("normalize.css");

import {style, STYLE_CONST} from './Styles/styles';
import {Defaults} from '../Constants/Defaults';
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

		const touchAreaHeight = this.state.windowHeight -
			( STYLE_CONST.TOP_PANEL_HEIGHT +
			//(STYLE_CONST.BORDER_WIDTH * 2) +
			(STYLE_CONST.PADDING * 2 )+
			STYLE_CONST.BOTTOM_PANEL_HEIGHT);

		return (
			<div id='body-wrapper'>
				<div style={style.title.container}>
					<span style={style.title.h1}>{Defaults.Title.toUpperCase()}</span>
				</div>
				<RecordPlayButtonGroup style={style.recordPlayButtonGroup.container} />
				<NoteGuideButton style={style.noteGuideButton.container} />
				<WaveformSelectGroup style={style.waveformSelectGroup.container} />
				<TouchArea
					width={this.state.windowWidth - (STYLE_CONST.PADDING*2)}
					height={touchAreaHeight}
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
