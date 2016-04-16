import * as React from 'react';
import { connect } from 'react-redux';
const Modal = require('react-modal');
import Audio from '../Audio';
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
		// this.handleChange = this.handleChange.bind(this);
		// this.handleFocus = this.handleFocus.bind(this);
		// this.handleBlur = this.handleBlur.bind(this);
		this.keyDown = this.keyDown.bind(this);
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
		const mobileSizeSmall = this.props.windowWidth < 512 || this.props.windowHeight < 500;
		const mobileLandscape = this.props.windowHeight < 450 && this.props.windowWidth > this.props.windowHeight;
		const largeSize = this.props.windowWidth > 700; 
			
		const {
			overlay,
			content_large,
			title,
			title_mobile,
			title_mobileLandscape,
			subtitle,
			subtitle_mobile,
			input,
			input_mobile,
			button,
			button_mobile,
		} = this.props.style;

		let {content} = this.props.style;
		let contentPaddingWidth = this.props.windowWidth / 6;
		contentPaddingWidth = contentPaddingWidth > 60 ? 60 : contentPaddingWidth;
		let contentPaddingHeight = this.props.windowHeight / 4;
		contentPaddingHeight = contentPaddingHeight > 60 ? 60 : contentPaddingHeight;
		
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
					<span style={Object.assign({},title, mobileSizeSmall && title_mobile, mobileLandscape && title_mobileLandscape)}>
						{this.state.title}</span>
					{this.buttons(button)}
				</div>
			</Modal>
		);
	}

	buttons(style) {
		if (!this.state.buttonsDisabled) {
			return (
				<div style={Object.assign({},
						{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-around',
						}
					)}>
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
			Audio.onPlaybackPress();
		}
	}

	// private handleChange(e){
	// 	const val = e.target.value ? e.target.value : DEFAULTS.Title;
	// 	this.setState({filename: val})
	// }
	//
	// private handleFocus(e){
	// 	console.log('on focus', e)
	// 	e.target.style.outline = 'none';
	// 	e.target.placeholder = '';
	// }
	//
	// private handleBlur(e){
	// 	console.log('on blur', e)
	// 	if (e.target.placeholder === '') {
	// 		e.target.placeholder = DEFAULTS.Title;
	// 	}
	// }
	
	private keyDown(e: KeyboardEvent) {
		if (e.keyCode === 13) { //Enter
			this.onDownloadSubmit();
		}
	}

	private closeModal(){
		console.log('asdasd')
		this.props.dispatch(downloadModalChange(false));
	}

	

	private onDownloadSubmit(){

		console.log('downloading')
		console.time('download started');

		this.setState({
			title: DEFAULTS.Copy.en.renderingAudio,
			buttonsDisabled: true,
		});
		this.forceUpdate();

		Audio.Download((wav: Blob) => {
			console.log('finished')
			console.timeEnd('download started')

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
				console.log('ended');
				window.plugins.socialsharing.share(
					null,
					filename,
					reader.result,
					null, this.successSharing, this.errorSharing)
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
