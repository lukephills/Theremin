import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import {STYLE} from './Styles/styles';
const Modal = require('react-modal');
import { startModalChange } from '../Actions/actions';
import { IGlobalState } from '../Constants/GlobalState';

const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

interface IProps {
	onStartPress?: Function;
	buttonDown?: boolean;
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
		};
		// this.startApp = this.startApp.bind(this);
		this.onTouchDown = this.onTouchDown.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.onTouchCancel = this.onTouchCancel.bind(this);
	}

	public render(): React.ReactElement<{}> {
		let {overlay, title, subtitle, button, buttonPressed} = this.props.style;
		let {content} = this.props.style;
		const contentPadding = 0;
		content = Object.assign({}, content, {
			top: contentPadding,
			left: contentPadding,
			right: contentPadding,
			bottom: contentPadding,
		});
		title = Object.assign({}, title, {
			fontSize: window.innerWidth / 7 < 80 ? window.innerWidth / 7 : 80,
			marginBottom: window.innerWidth / 20,
		});

		subtitle = Object.assign({}, subtitle, {
			fontSize: window.innerWidth / 20 < 28 ?  window.innerWidth / 20 : 28,
			marginBottom: window.innerWidth / 20,
		});

		button = Object.assign({}, button, {
			fontSize: window.innerWidth / 15 < 62 ? window.innerWidth / 15 : 62,
		});

		return (
			<Modal isOpen={this.props.isOpen}
			       onRequestClose={this.startApp}
			       style={{content, overlay}}>

				<ReactCSSTransitionGroup transitionName="example"
				                         transitionAppear={true}
				                         transitionAppearTimeout={0}
				                         transitionEnterTimeout={0}
				                         transitionLeaveTimeout={0}>
					<div key="start-modal">
						{this.startButton(button, buttonPressed)}
					</div>
				</ReactCSSTransitionGroup>
			</Modal>
		);
	}

	private startButton(style, pressedStyle) {
		style = Object.assign({}, style);
		const playIconStyle = Object.assign({}, STYLE.startModal.playIcon, this.state.buttonDown && STYLE.startModal.playIconPressed);
		return <div style={style}
		            onTouchStart={this.onTouchDown}
		            onTouchEnd={this.onTouchEnd}
		            onTouchCancel={this.onTouchCancel}
		            onMouseDown={this.onTouchDown}
		            onMouseUp={this.onTouchEnd}
		            onMouseLeave={this.onTouchCancel}
		>
			<svg width="230" height="230" style={playIconStyle} viewBox="0 0 230 230" xmlns="http://www.w3.org/2000/svg"><title>Triangle 2</title><path fill="#444" d="M230 115L0 230V0" fill-rule="evenodd"/></svg>
		</div>;
	}

	private onTouchDown(e) {
		e.preventDefault();
		this.setState({buttonDown: true});
	}

	private onTouchEnd(e) {
		this.setState({buttonDown: false});
		this.startApp(e);
	}

	private onTouchCancel(e) {
		this.setState({buttonDown: false});
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
