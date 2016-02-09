import * as React from 'react';
import { styles } from './Styles/styles'

interface IToggleProps {
	isOn?: boolean;
	onClick?: any;
	children?: string;
}

class ToggleButton extends React.Component<IToggleProps, {}> {

	public render(): React.ReactElement<{}> {

		return (
			<button
				style={this.getStyles()}
				onClick={this.props.onClick}>
				{this.props.children}
			</button>
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
