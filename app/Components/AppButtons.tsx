import * as React from 'react';
import {DEFAULTS} from '../Constants/Defaults';

class AppButtons extends React.Component<any, any> {

	public render(): React.ReactElement<{}> {

		let button = this.props.buttonStyle;
		let containerStyle = this.props.containerStyle;

		return (
			<div style={containerStyle}>
				<div style={button}
				     onTouchStart={this.openIOSAppLink}
				     onMouseDown={this.openIOSAppLink}>
					<span>Apple Store</span>
				</div>
				<div style={button}
				     onTouchStart={this.openChromeAppLink}
				     onMouseDown={this.openChromeAppLink}>
					<span>Chrome Store</span>
				</div>
			</div>
		);
	}
	
	private openIOSAppLink() {
		window.open(DEFAULTS.Links.iosAppStore)
	}

	private openChromeAppLink() {
		window.open(DEFAULTS.Links.chromeAppStore)
	}

}
export default AppButtons;
