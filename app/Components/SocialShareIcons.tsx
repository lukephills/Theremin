import * as React from 'react';
import {DEFAULTS} from '../Constants/Defaults';

class SocialShareIcons extends React.Component<any, any> {

	constructor(props){
		super(props);
		this.state = {
			fbCount: '',
			twCount: '',
		}
		this.getFacebookCount(DEFAULTS.Links.homepage);
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

	private getFacebookCount(url) {
		this.ajaxRequest('http://graph.facebook.com/?ids=' + url, (data) => {
			this.setState({
				fbCount: data[url].shares + ' shares',
			})
		});
	}

	private shareOnFacebook() {
		//TODO: Update share image
		var popUp = window.open('http://www.facebook.com/sharer/sharer.php?s=100&p[url]=http://femurdesign.com/theremin', 'popupwindow', 'scrollbars=yes,width=800,height=400');
		popUp.focus();
		return false;
	}

	//TODO: add an image to go with twitter share
	private shareOnTwitter(){
		// var popUp = window.open('http://twitter.com/home?status=Theremin - An Online Playable Touch Synthesizer+http://femurdesign.com/theremin/+via @femurdesign', 'popupwindow', 'scrollbars=yes,width=800,height=400');
		var text = 'Theremin+by+@femurdesign.+Play+your+own+theremin+%23synth.';
		var popUp = window.open('http://twitter.com/share?text='+text, 'popupwindow', 'scrollbars=yes,width=800,height=400');


		popUp.focus();
		return false
	}


	public render(): React.ReactElement<{}> {

		return (
			<div className="share">
				<li className="facebook">
					<a href="#"
					   className="btnFb"
					   data-href={DEFAULTS.Links.homepage}
					   onClick={this.shareOnFacebook}>
						<div className="count">
							<p className="fbCount">{this.state.fbCount}</p>
						</div>
					</a>
				</li>
				<li className="twitter">
					<a href="#"
					   className="tweet btnTw"
					   data-url={DEFAULTS.Links.homepage}
					   onClick={this.shareOnTwitter}>
						<div className="count">
							<p className="twCount">{this.state.twCount}</p>
						</div>
					</a>
				</li>
			</div>
		);
	}
}
export default SocialShareIcons;
