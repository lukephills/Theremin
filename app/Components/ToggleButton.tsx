import * as React from 'react';
import { styles } from './Styles/styles'

interface IProps {
	id?: string;
	key?: number;
	isOn?: boolean;
	onClick?: any;
	children?: string;
}

class ToggleButton extends React.Component<IProps, {}> {

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
