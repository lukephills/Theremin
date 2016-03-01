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
	style?: any;
}

class ToggleButton extends React.Component<IProps, {}> {
	constructor(props){
		super(props);
		this.onDown = this.onDown.bind(this);
	}

	public render(): React.ReactElement<{}> {

		const props = {
			onClick: this.onDown,
			onTouchStart: this.onDown,
			style: this.getStyles(),
			value: this.props.buttonValue,
		};

		return (
			<div {...props}>
				{this.props.children}
			</div>
		);
	}

	private onDown(e) {
		e.preventDefault();
		this.props.disabled ? false : this.props.onDown(e);
	}

	private getStyles() {
		return Object.assign(
			{},
			style.button,
			this.props.isOn && style.buttonActive,
			this.props.disabled && style.buttonDisabled,
			this.props.style || {}
		);
	}
}
export default ToggleButton;
