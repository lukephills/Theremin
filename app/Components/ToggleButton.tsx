import * as React from 'react';
import { styles } from './Styles/styles'

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
			styles.button,
			this.props.isOn && styles.buttonActive
		);
	}
}
export default ToggleButton;
