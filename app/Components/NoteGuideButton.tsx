import * as React from 'react';
import { connect } from 'react-redux';
import { NoteGuide } from '../Actions/aNoteGuide';
import ToggleButton from './ToggleButton';

interface INodeGuideButtonProps {
	dispatch?: Function;
	isOn?: boolean;
}

function select(state: any): any {
	return {
		isOn: state.NoteGuide.isOn
	};
}

@connect(select)
class NodeGuideButton extends React.Component<INodeGuideButtonProps, {}> {

	public render(): React.ReactElement<{}> {

		return (
			<div>
				<ToggleButton
					onClick={() => this.onButtonClick()}
				    isOn={this.props.isOn}
					buttonValue="Guides"/>
			</div>
		);
	}

	private onButtonClick(): void {
		this.props.dispatch(NoteGuide());
	}
}
export default NodeGuideButton;
