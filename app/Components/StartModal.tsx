import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
const Modal = require('react-modal');
import { startModalChange } from '../Actions/actions';
import { IGlobalState } from '../Constants/GlobalState';
import {DEFAULTS} from '../Constants/Defaults';
import AppButtons from './AppButtons';
import {prefixer} from './Styles/styles';

interface IProps {
	mainText: string;
	secondaryText: string;
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

		//TODO: make this a global check
		var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
		if (iOS) {
			this.state = {
				mainText: DEFAULTS.Copy.en.startTextMain,
				secondaryText: DEFAULTS.Copy.en.startTextSecondary,
			};
		} else {
			this.state = {
				mainText: DEFAULTS.Copy.en.recorderOnlyWorksInPaidVersionMain,
				secondaryText: DEFAULTS.Copy.en.recorderOnlyWorksInPaidVersionSecondary,
			};
		}


		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
	}

	public render(): React.ReactElement<{}> {

		const largeSize = this.props.windowWidth > 700;

		const {
			overlay,
			content_large,
			title,
			subtitle,
		} = this.props.style;

		let {content, button} = this.props.style;
		content = prefixer.prefix(Object.assign({}, content, {
			top: -60,
			left: 0,
			right: 0,
			bottom: 0,
			margin: 'auto',
			width: '98%',
			maxWidth: 480,
			flexDirection: 'column',
		}));

		const appButtonsContainer = prefixer.prefix(Object.assign({}, {
			display: 'flex',
			maxWidth: 380,
			width: '100%',
			marginBottom: 8,
			flexDirection: 'column',
		}));

		const titleContainer = Object.assign({},{
			width: '100%',
		});

		const closeButton = Object.assign({}, {
			position: 'absolute',
			right: 0,
			top: 0,
			fontSize: 36,
			fontWeight: 400,
			cursor: 'pointer',
			padding: '10px 20px',
		});

		return (
			<Modal
				isOpen={this.props.isOpen}
				onRequestClose={this.onRequestClose}
				style={{content: Object.assign({}, content, largeSize && content_large), overlay}}>
				<span style={closeButton}
				      onTouchStart={this.onRequestClose}
				      onClick={this.onRequestClose}
				>{'\u00D7'}</span>
				<div style={titleContainer}>
					<span style={title}>{this.state.mainText}</span>
					<span style={subtitle}>{this.state.secondaryText}</span>
				</div>

				<AppButtons containerStyle={appButtonsContainer} buttonStyle={button}/>
			</Modal>
		);
	}

	private onTouchEnd(e) {
		this.startApp(e);
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
			this.closeModal();
		});
	}

	private onRequestClose(e){
		this.startApp(e);
	}
	private closeModal(){
		this.props.dispatch(startModalChange(false));
		this.setState({
			mainText: DEFAULTS.Copy.en.recorderOnlyWorksInPaidVersionMain,
			secondaryText: DEFAULTS.Copy.en.recorderOnlyWorksInPaidVersionSecondary,
		});
	}
	
}
export default StartModal;
