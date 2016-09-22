import * as React from 'react';
import {DEFAULTS} from '../Constants/Defaults';

class AppButtons extends React.Component<any, any> {

	public render(): React.ReactElement<{}> {

		let containerStyle = this.props.containerStyle;
		const {iosAppStore, chromeAppStore, androidAppStore} = DEFAULTS.Links;

		return (
			<div className="appStoreLinks" style={containerStyle}>
				<ul>
					<li><a href={iosAppStore}>iOS <span className="chevron chevron-right">&#8963;</span></a></li>
					<li><a href={androidAppStore}>Android <span className="chevron chevron-right">&#8963;</span></a></li>
					<li><a href={chromeAppStore}>Desktop <span className="chevron chevron-right">&#8963;</span></a></li>
				</ul>
			</div>
		);
	}

}
export default AppButtons;
