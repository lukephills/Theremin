import * as React from 'react';
import { connect } from 'react-redux';
var Modal = require('react-modal');
import Audio from '../Audio';
import Downloader from '../Downloader';
import { modal } from '../Actions/actions';
import {IGlobalState} from '../Constants/GlobalState';

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

		this.state = {
			modalIsOpen: this.props.isActive,
			filename: 'theremin',
		};
	}

	public render(): React.ReactElement<{}> {
		return (
			<Modal isOpen={this.props.isOpen}
			       onRequestClose={this.closeModal}>
				<h1><span>{this.state.filename}.wav</span></h1>
				<input type="text" placeholder="Theremin" onChange={this.handleChange}/>
				<button onClick={this.onDownloadClick}>Download</button>
			</Modal>
		);
	}

	handleChange(e){
		this.setState({filename: e.target.value})
	}

	closeModal(){
		console.log('close')
		this.props.dispatch(modal(false));
	}

	onDownloadClick(){
		Audio.Download((wav: Blob) => {
			this.SaveWav(wav);
			console.log('saved wav: ', this.state.filename, wav);
		});
		this.props.dispatch(modal(false));
	}

	private sanitizeFilename(filename: string): string {
		return filename;
	}


	SaveWav(wav: Blob){
		const url = (window.URL || (window as any).webkitURL).createObjectURL(wav);
		const link: HTMLAnchorElement = document.createElement('a');
		link.href = url;

		const downloadAttrSupported: boolean = ('download' in link);
		if (downloadAttrSupported) {
			link.setAttribute('download', `${this.sanitizeFilename(this.state.filename)}.wav`);
			let click = document.createEvent("Event");
			click.initEvent("click", true, true);
			link.dispatchEvent(click);
		} else {
			// Show the anchor link with instructions to 'right click save as'
			link.innerHTML = 'right click save as'
			document.body.appendChild(link); //FIXME: append to a pop up box instead of body
			//TODO: could use this to trigger a saveAs() https://github.com/koffsyrup/FileSaver.js
		}
	}
}
export default RecordOverlay;
