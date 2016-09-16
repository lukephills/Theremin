import * as React from 'react';
import { connect } from 'react-redux';
const Modal = require('react-modal');
import ToggleButton from './ToggleButton'
import { downloadModalChange, RecorderStateChange, PlayerStateChange } from '../Actions/actions';
import {IGlobalState} from '../Constants/GlobalState';
import { DEFAULTS } from '../Constants/Defaults';
import {STATE} from '../Constants/AppTypings';

function select(state: IGlobalState): any {
	return {
		isOpen: state.DownloadModal.isOpen,
		playerState: state.Player.playerState,
		recordState: state.Recorder.recordState,
	};
}

@connect(select)
class DownloadModal extends React.Component<any, any> {

	constructor(props){
		super(props);

		this.state = {
			buttonsDisabled: false,
			filename: 'theremin',
			title: this.downloadText,
			filesize: null,
		};

		this.onDownloadSubmit = this.onDownloadSubmit.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.onDownloadModalOpen = this.onDownloadModalOpen.bind(this)

	}

	private get downloadText(): string {
		let str;
		if (window.cordova) {
			str = DEFAULTS.Copy.en.sharePrompt;
		} else {
			str = DEFAULTS.Copy.en.downloadPrompt;
		}
		return str;
	}

	public render(): React.ReactElement<{}> {
		const largeSize = this.props.windowWidth > 700; 
			
		const {
			overlay,
			content_large,
			title,
			button,
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


		return (
			<Modal isOpen={this.props.isOpen}
			       onAfterOpen={this.onDownloadModalOpen}
			       onRequestClose={this.closeModal}
			       style={{content: Object.assign({}, content, largeSize && content_large), overlay}}>
				<div>
					<span style={Object.assign({}, title)}>
						{this.state.title}</span>
					{this.buttons(button, buttonContainer)}
				</div>
			</Modal>
		);
	}

	buttons(style, buttonContainerStyle) {
		if (!this.state.buttonsDisabled) {
			return (
				<div style={Object.assign({}, buttonContainerStyle)}>
					<ToggleButton onTouchStart={this.onDownloadSubmit}
					              onClick={this.onDownloadSubmit}
					              style={Object.assign({}, style)}>
						<div>OK</div>
					</ToggleButton>
					<ToggleButton onTouchEnd={this.closeModal}
					              onClick={this.closeModal}
					              style={Object.assign({}, style)}>
						<div>Cancel</div>
					</ToggleButton>
				</div>
			)
		} else {
			return <span></span>;
		}
	}

	private onDownloadModalOpen() {
		// If we're currently recording, stop recording and start playing the loop to 
		// avoid accidental sound stopping.
		if (this.props.recordState === STATE.RECORDING || this.props.recordState === STATE.OVERDUBBING) {
			this.props.dispatch(RecorderStateChange(STATE.PLAYING));
			this.props.dispatch(PlayerStateChange(STATE.PLAYING));
			// Press play button to start playing back the loop
			this.props.Audio.onPlaybackPress();
		}
	}

	private closeModal(){
		this.props.dispatch(downloadModalChange(false));
	}

	private onDownloadSubmit(){
		this.setState({
			title: DEFAULTS.Copy.en.renderingAudio,
			buttonsDisabled: true,
		});
		this.forceUpdate();

		this.props.Audio.Download((wav: Blob) => {
			this.setState({
				title: this.downloadText,
				buttonsDisabled: false,
			});

			if (window.cordova){
				this.shareAudioUsingCordova(wav, DEFAULTS.Copy.en.filename);
			} else {
				this.downloadWav(wav);
			}

			this.props.dispatch(downloadModalChange(false));
		});
	}

	private sanitizeFilename(s: string): string {
		return s.replace(/[^a-z0-9_\-]/gi, '_');
	}

	private downloadWav(wav: Blob){
		const url = (window.URL || (window as any).webkitURL).createObjectURL(wav);
		const link: HTMLAnchorElement = document.createElement('a');
		link.href = url;
		const downloadAttrSupported = ('download' in link);
		if (downloadAttrSupported) {
			link.setAttribute('download', `${this.sanitizeFilename(this.state.filename)}.wav`);
			let click = document.createEvent("Event");
			click.initEvent("click", true, true);
			link.dispatchEvent(click);
		}
	}

	//TODO: Make rendering the loop asyncrounous too.
	private shareAudioUsingCordova(wav: Blob, filename){
		if (wav.size > 5242880) {
			navigator.notification.alert(DEFAULTS.Copy.en.recordingTooLong, () => {
				return;
			}, DEFAULTS.Copy.en.cantShare);
		} else {
			var reader = new FileReader();
			reader.onloadend = function() {
				window.plugins.socialsharing.share(
					null,
					'Theremin recording',
					reader.result,
					'https://femurdesign.com',
					this.successSharing, this.errorSharing)
			}
			
			reader.onerror = function(e: any) {
				console.log('File could not be read! Error:', e);
			}
			reader.readAsDataURL(wav);
		}
	}

	successSharing(e) {
		console.log('success', e)
	}

	errorSharing(e) {
		console.log('error', e)
	}


}
export default DownloadModal;
