import * as React from 'react';
import { style } from './Styles/styles'

interface IProps {
	id?: string;
	key?: number;
	isOn?: boolean;
	onClick?: any;
	buttonValue?: string;
}

class ToggleButton extends React.Component<IProps, {}> {

	public render(): React.ReactElement<{}> {
		return (
			<div
				style={this.getStyles()}
				onClick={this.props.onClick}
				value={this.props.buttonValue}>
				{this.props.buttonValue}
			</div>
		);
	}

	private getStyles() {
		return Object.assign(
			{},
			style.button,
			this.props.isOn && style.buttonActive
		);
	}
}
export default ToggleButton;
