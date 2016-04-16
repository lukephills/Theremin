import * as React from 'react';
import { STYLE } from './Styles/styles';

interface IProps {
	disabled?: boolean;
	id?: string;
	key?: number;
	isOn?: boolean;
	onDown?: any;
	onTouchEnd?: any;
	buttonValue?: string;
	children?: any;
	style?: any;
}

class ToggleButton extends React.Component<IProps, {}> {
	constructor(props: IProps) {
		super(props);
		this.onDown = this.onDown.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this)
	}

	public render(): React.ReactElement<{}> {

		const props: any = {
			onClick: this.onDown,
			onTouchStart: this.onDown,
			onTouchEnd: this.onTouchEnd,
			style: this.getStyles(),
			value: this.props.buttonValue,
		};

		return (
			<div {...props}>
				{this.props.children}
			</div>
		);
	}

	private onTouchEnd(e: Event): void {
		e.preventDefault();
		if (!this.props.disabled) {
			this.props.onTouchEnd(e);
		}
	}
	
	private onDown(e: Event): void {
		e.preventDefault();
		if (!this.props.disabled) {
			this.props.onDown(e);
		}
	}

	private getStyles(): any {
		return Object.assign(
			{},
			STYLE.button,
			this.props.isOn && STYLE.buttonActive,
			this.props.disabled && STYLE.buttonDisabled,
			this.props.style || {}
		);
	}
}
export default ToggleButton;
