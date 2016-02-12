import * as React from 'react';
import { connect } from 'react-redux';
import { NoteGuide } from '../Actions/actions';
import ToggleButton from './ToggleButton';
import { IGlobalState } from '../Constants/GlobalState';

interface IProps {
	dispatch?: Function;
	isOn?: boolean;
	style?: any;
}

function select(state: IGlobalState): any {
	return {
		isOn: state.NoteGuide.isOn
	};
}

@connect(select)
class NodeGuideButton extends React.Component<IProps, {}> {

	public render(): React.ReactElement<{}> {

		return (
			<div style={this.props.style}>
				<ToggleButton
					onClick={(e) => this.onButtonClick(e)}
				    isOn={this.props.isOn}
					buttonValue="Guides"/>
			</div>
		);
	}

	private onButtonClick(e): void {
		e.preventDefault();
		this.props.dispatch(NoteGuide());
	}
}
export default NodeGuideButton;
