import * as React from 'react';
import {DEFAULTS} from '../Constants/Defaults';

class SocialShareIcons extends React.Component<any, any> {

	constructor(props){
		super(props);
		this.shareOnTwitter = this.shareOnTwitter.bind(this);
		this.shareOnFacebook = this.shareOnFacebook.bind(this);
	}


	//TODO: add to utils
	private ajaxRequest(url, callback) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onload = function() {
			if (this.status >= 200 && this.status < 400) {
				var data = JSON.parse(this.response);
				callback(data);
			} else {
				console.error(this.status);
			}
		};
		request.onerror = function(err) {
			console.error(err);
		};
		request.send();
	}

	private shareOnFacebook() {
		//TODO: Update share image
		var popUp = window.open('//www.facebook.com/sharer/sharer.php?s=100&u=https://femurdesign.com/theremin', 'popupwindow', 'scrollbars=yes,width=800,height=400');
		popUp.focus();
		return false;
	}

	//TODO: add an image to go with twitter share
	private shareOnTwitter(){
		var text = 'Theremin+by+@femurdesign.+Play+your+own+theremin+%23synth.';
		var popUp = window.open('//twitter.com/share?text='+text, 'popupwindow', 'scrollbars=yes,width=800,height=400');


		popUp.focus();
		return false;
	}


	public render(): React.ReactElement<{}> {

		return (
			<div className="share">
				<li className="facebook">
					<a href="#"
					   className="btnFb"
					   data-href={DEFAULTS.Links.homepage}
					   onClick={this.shareOnFacebook}
					   onTouchStart={this.shareOnFacebook}>
					</a>
				</li>
				<li className="twitter">
					<a href="#"
					   className="tweet btnTw"
					   data-url={DEFAULTS.Links.homepage}
					   onClick={this.shareOnTwitter}
					   onTouchStart={this.shareOnTwitter}>
					</a>
				</li>
			</div>
		);
	}
}
export default SocialShareIcons;
