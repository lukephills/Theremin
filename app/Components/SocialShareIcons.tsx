import * as React from 'react';
import {DEFAULTS} from '../Constants/Defaults';

class SocialShareIcons extends React.Component<any, any> {

	constructor(props){
		super(props);
	}

	public render(): React.ReactElement<{}> {

		return (
			<div className="share">
				<li className="facebook">
					<a href="//www.facebook.com/sharer/sharer.php?s=100&u=https://femurdesign.com/theremin"
						target="_blank"
						className="btnFb"
						data-href={DEFAULTS.Links.homepage}>
					</a>
				</li>
				<li className="twitter">
					<a href="//twitter.com/share?text=Theremin+by+@femurdesign.+Play+your+own+theremin+%23synth."
						target="_blank"
						className="tweet btnTw"
						data-url={DEFAULTS.Links.homepage}>
					</a>
				</li>
			</div>
		);
	}
}
export default SocialShareIcons;
