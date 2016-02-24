import * as React from 'react';
import { style } from './Styles/styles';

interface IProps {
	disabled?: boolean;
	id?: string;
	key?: number;
	isOn?: boolean;
	onDown?: any;
	buttonValue?: string;
	children?: any;
}

class ToggleButton extends React.Component<IProps, {}> {

	public render(): React.ReactElement<{}> {

		const props = {
			onClick: this.props.disabled ? false : this.props.onDown,
			onTouchStart: this.props.disabled ? false : this.props.onDown,
			style: this.getStyles(),
			value: this.props.buttonValue,
		};

		return (
			<div {...props}>
				{this.props.children}
			</div>
		);
	}

	private getStyles() {
		return Object.assign(
			{},
			style.button,
			this.props.isOn && style.buttonActive,
			this.props.disabled && style.buttonDisabled
		);
	}
}
export default ToggleButton;
