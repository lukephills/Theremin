import * as React from 'react';
import { STYLE } from './Styles/styles';

interface IProps {
	disabled?: boolean;
	id?: string;
	key?: number;
	isOn?: boolean;
	onTouchStart?: any;
	onTouchEnd?: any;
	onTouchCancel?: any;
	onClick?: any;
	buttonValue?: string;
	children?: any;
	style?: any;
}

class ToggleButton extends React.Component<IProps, {}> {
	private _touchIdentifiers;
	constructor(props: IProps) {
		super(props);
		this._touchIdentifiers = {}

		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.onTouchCancel = this.onTouchEnd.bind(this);
		this.onClick = this.onClick.bind(this);
	}

	public render(): React.ReactElement<{}> {

		const props: any = {
			onClick: this.onClick,
			onTouchStart: this.onTouchStart,
			onTouchCancel: this.onTouchCancel,
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


	
	private onTouchStart(e: TouchEvent): void {
		e.preventDefault();
		if (!this.props.disabled) {
			const touches = e.changedTouches;
			for (let i = 0; i < touches.length; i++) {
				const touch = touches[i];
				this._touchIdentifiers[touch.identifier] = document.elementFromPoint(touch.pageX, touch.pageY);
				if (this.props.onTouchStart){
					this.props.onTouchStart(e);
				}
			}
		}
	}

	private onTouchEnd(e: TouchEvent): void {
		e.preventDefault();
		if (!this.props.disabled) {
			const touches = e.changedTouches;
			for (let i = 0; i < touches.length; i++) {
				const touch = touches[i];
				if (this._touchIdentifiers[touch.identifier] === document.elementFromPoint(touch.pageX, touch.pageY)) {
					if (this.props.onTouchEnd){
						this.props.onTouchEnd(e);
					}
				} else {
					if (this.props.onTouchCancel) {
						this.props.onTouchCancel(e);
					}
				}
				delete this._touchIdentifiers[touch.identifier];
			}
		}
	}

	onTouchCancel(e: TouchEvent): void {
		e.preventDefault();
		if (this.props.onTouchCancel) {
			this.props.onTouchCancel(e);
		}
	}

	private onClick(e: Event): void {
		e.preventDefault();
		if (!this.props.disabled) {
			if (this.props.onClick){
				this.props.onClick(e);
			}
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
