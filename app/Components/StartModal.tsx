import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
const Modal = require('react-modal');
import { startModalChange } from '../Actions/actions';
import { IGlobalState } from '../Constants/GlobalState';
import {DEFAULTS} from '../Constants/Defaults';

const appleStoreImage = require('../Assets/images/apple-app-store.png');
const chromeStoreImage = require('../Assets/images/chrome-web-store.png');
const androidStoreImage = require('../Assets/images/google-play-store.png');

const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

interface IProps {
	onStartPress?: Function;
	buttonDown?: boolean;
	startText?: string;
}

function select(state: IGlobalState): any {
	return {
		isOpen: state.StartModal.isOpen,
	};
}

@connect(select)
class StartModal extends React.Component<any, IProps> {

	constructor(props){
		super(props);
		this.state = {
			buttonDown: false,
			startText: DEFAULTS.Copy.en.startText,
		}
		// this.startApp = this.startApp.bind(this);
		this.onTouchDown = this.onTouchDown.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.onTouchCancel = this.onTouchCancel.bind(this);
	}

	public render(): React.ReactElement<{}> {

		const largeSize = this.props.windowWidth > 700;

		const {
			overlay,
			content_large,
			title,
			button,
			subtitle,
			buttonPressed,
			buttonContainer,
		} = this.props.style;

		let {content} = this.props.style;
		content = Object.assign({}, content, {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			margin: 'auto',
		});

		//TODO: move to styles
		const appStoreImagesContainer = Object.assign({}, {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: 550,
		})
		const appStoreImageContainer = Object.assign({}, {
			maxWidth: 160,
		})
		const appStoreImage = Object.assign({}, {
			width: '100%',
		})


		return (
			<Modal isOpen={this.props.isOpen}
			       onRequestClose={this.startApp}
			       style={{content: Object.assign({}, content, largeSize && content_large), overlay}}>
				<div key="start-modal">
					<span>Theremin App</span>

					<ul>
						<li>Record yourself</li>
						<li>Create loops, add overdubs &amp; play over the top</li>
						<li>Share/download your recording as a .wav file</li>
						<li>Use all 10 fingers with multitouch</li>
						<li>Works Offline</li>
					</ul>
					<div style={appStoreImagesContainer}>
						<div style={appStoreImageContainer}>
							<img src={appleStoreImage} style={appStoreImage} />
						</div>
						<div style={appStoreImageContainer}>
							<img src={chromeStoreImage} style={appStoreImage} />
						</div>
						<div style={appStoreImageContainer}>
							<img src={androidStoreImage} style={appStoreImage} />
						</div>
					</div>
					{this.startModalCopy(title, subtitle, button, buttonPressed)}
				</div>
			</Modal>
		);
	}

	private startModalCopy(titleStyle, subtitleStyle, buttonStyle, buttonPressedStyle) {
		return this.startButton(buttonStyle, buttonPressedStyle)
	}

	private startButton(style, pressedStyle) {
		style = Object.assign({}, style, this.state.buttonDown && pressedStyle)
		return <div style={style}
		            onTouchStart={this.onTouchDown}
		            onTouchEnd={this.onTouchEnd}
		            onTouchCancel={this.onTouchCancel}
		            onMouseDown={this.onTouchDown}
		            onMouseUp={this.onTouchEnd}
		            onMouseLeave={this.onTouchCancel}
		>
			<span>{this.state.startText}</span>
		</div>
	}

	private onTouchDown(e) {
		e.preventDefault();
		this.setState({buttonDown: true, startText: DEFAULTS.Copy.en.resumeText});
	}

	private onTouchEnd(e) {
		this.setState({buttonDown: false});
		this.startApp(e)
	}

	private onTouchCancel(e) {
		this.setState({buttonDown: false})
	}


	public componentDidMount() {
	// Get the components DOM node
		var elem: any = ReactDOM.findDOMNode(this);
		// Set the opacity of the element to 0
		elem.style.opacity = 0;
		window.requestAnimationFrame(function() {
			// Now set a transition on the opacity
			elem.style.transition = "opacity 250ms";
			// and set the opacity to 1
			elem.style.opacity = 1;
		});
	}

	private startApp(e){
		e.preventDefault();
		this.props.onStartPress(() => {
			this.props.dispatch(startModalChange(false));
		});
	}
	
}
export default StartModal;
