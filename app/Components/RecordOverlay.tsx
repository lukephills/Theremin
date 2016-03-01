import * as React from 'react';
import { connect } from 'react-redux';
var Modal = require('react-modal');
import Audio from '../Audio';
import Downloader from '../Downloader';
import ToggleButton from './ToggleButton'
import { modalChange } from '../Actions/actions';
import {IGlobalState} from '../Constants/GlobalState';
import {STYLE_CONST} from './Styles/styles';

function select(state: IGlobalState): any {
	return {
		isOpen: state.Modal.isOpen,
	};
}

@connect(select)
class RecordOverlay extends React.Component<any, any> {

	constructor(props){
		super(props);
		this.onDownloadClick = this.onDownloadClick.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.onFocus = this.onFocus.bind(this);

		this.state = {
			modalIsOpen: this.props.isActive,
			filename: 'theremin',
		};
	}

	public render(): React.ReactElement<{}> {
		const {overlay, title, input, button} = this.props.style;
		let {content} = this.props.style;
		const contentPadding = window.innerWidth / 14;
		content = Object.assign({}, content, {
			top: contentPadding,
			left: contentPadding,
			right: contentPadding,
			bottom: contentPadding,
		})
		return (
			<Modal isOpen={this.props.isOpen}
			       onRequestClose={this.closeModal}
			       style={{content, overlay}}>
				<div>
					<span style={title}>Choose a filename</span>
					<input type="text"
					       placeholder={this.state.filename || 'Theremin'}
					       onChange={this.handleChange}
					       onFocus={this.onFocus}
					       style={input}/>
					<ToggleButton onDown={this.onDownloadClick}
					              style={button}>
						<div>Save {this.state.filename}.wav</div>
					</ToggleButton>
				</div>
			</Modal>
		);
	}

	private handleChange(e){
		const val = e.target.value ? e.target.value : 'theremin';
		this.setState({filename: val})
	}

	private onFocus(e){
		e.target.style.outline = 'none'
	}

	private closeModal(){
		console.log('close')
		this.props.dispatch(modalChange(false));
	}

	private onDownloadClick(){
		Audio.Download((wav: Blob) => {
			this.saveWav(wav);
			console.log('saved wav: ', this.state.filename, wav);
		});
		this.props.dispatch(modalChange(false));
	}

	private sanitizeFilename(s: string): string {
		return s.replace(/[^a-z0-9_\-]/gi, '_');
	}

	private saveWav(wav: Blob){
		const url = (window.URL || (window as any).webkitURL).createObjectURL(wav);
		const link: HTMLAnchorElement = document.createElement('a');
		link.href = url;

		const downloadAttrSupported: boolean = ('download' in link);
		if (downloadAttrSupported) {
			link.setAttribute('download', `${this.sanitizeFilename(this.state.filename)}.wav`);
			let click = document.createEvent("Event");
			click.initEvent("click", true, true);
			link.dispatchEvent(click);
		}
		//else {
		//	// Show the anchor link with instructions to 'right click save as'
		//	link.innerHTML = 'right click save as'
		//	document.body.appendChild(link); //FIXME: append to a pop up box instead of body
		//	//TODO: could use this to trigger a saveAs() https://github.com/koffsyrup/FileSaver.js
		//}
	}
}
export default RecordOverlay;
