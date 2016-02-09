import * as React from 'react';
import { connect } from 'react-redux';
import { NoteGrid } from '../Actions/aNoteGrid';
import ToggleButton from './ToggleButton';

interface INoteGridButtonProps {
	dispatch?: Function;
	isOn?: boolean;
}

function select(state: any): any {
	return {
		isOn: state.NoteGrid.isOn
	};
}

@connect(select)
class NoteGridButton extends React.Component<INoteGridButtonProps, {}> {

	public render(): React.ReactElement<{}> {

		return (
			<div>
				<span>NoteGridButton:</span>
				<ToggleButton
					onClick={() => this.onButtonClick()}
				    isOn={this.props.isOn}
				>
					Note Grid Button
				</ToggleButton>
			</div>
		);
	}

	private onButtonClick(): void {
		this.props.dispatch(NoteGrid());
	}
}
export default NoteGridButton;
