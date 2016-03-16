import * as React from 'react';
import { connect } from 'react-redux';
const Modal = require('react-modal');
const Radium = require('radium');
import Audio from '../Audio';
import ToggleButton from './ToggleButton'
import { modalChange } from '../Actions/actions';
import {IGlobalState} from '../Constants/GlobalState';
import {STYLE_CONST} from './Styles/styles';
import { DEFAULTS } from '../Constants/Defaults';

function select(state: IGlobalState): any {
	return {
		isOpen: state.Modal.isOpen,
	};
}

@Radium
@connect(select)
class DownloadModal extends React.Component<any, any> {

	constructor(props){
		super(props);
		this.onDownloadSubmit = this.onDownloadSubmit.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.keyDown = this.keyDown.bind(this);
		this.onButtonHover = this.onButtonHover.bind(this)

		this.state = {
			modalIsOpen: this.props.isActive,
			filename: 'theremin',
		};
	}

	public render(): React.ReactElement<{}> {
		const {overlay, title, subtitle, input, button} = this.props.style;
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
					<span style={title}>Download</span>
					<span style={subtitle}>Choose a filename</span>
					<input type="text"
					       placeholder={this.state.filename || 'Theremin'}
					       onChange={this.handleChange}
					       onKeyDown={this.keyDown}
					       onFocus={this.onFocus}
					       onBlur={this.onBlur}
					       style={input}/>
					<ToggleButton onDown={this.onDownloadSubmit}
					              style={button}>
						<div>Save {this.state.filename}.wav</div>
					</ToggleButton>
				</div>
			</Modal>
		);
	}

	private handleChange(e){
		const val = e.target.value ? e.target.value : DEFAULTS.Title;
		this.setState({filename: val})
	}

	private onFocus(e){
		e.target.style.outline = 'none';
		e.target.placeholder = '';
	}

	private onBlur(e){
		if (e.target.placeholder === '') {
			e.target.placeholder = DEFAULTS.Title;
		}
	}

	private onButtonHover(e) {
		console.log('hover button state', e);
	}

	private keyDown(e: KeyboardEvent) {
		if (e.keyCode === 13) { //Enter
			this.onDownloadSubmit();
		}
	}

	private closeModal(){
		this.props.dispatch(modalChange(false));
	}

	private onDownloadSubmit(){
		Audio.Download((wav: Blob) => {
			this.saveWav(wav);
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
export default DownloadModal;
