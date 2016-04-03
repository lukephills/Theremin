import * as React from 'react';
import {STYLE_CONST} from './Styles/styles';
import { DEFAULTS } from '../Constants/Defaults';


class SplashScreen extends React.Component<any, any> {

	private splashHasPlayed: boolean;

	constructor() {
		super();
		this.splashHasPlayed = false;
		this.state = {
			timer: 0,
			splashHasPlayed: false,
		};
	}

	private animate() {
		const startTime: any = new Date();
		const interval = setInterval(() => {
			const newTime: any = new Date();
			this.setState({
				timer: (newTime - startTime),
			});
		}, 30)
		if (this.state.timer > 5000) {
			clearInterval(interval)
		}
		this.splashHasPlayed = true;
	}

	public render(): React.ReactElement<{}> {

		if (this.state.timer < 2000) {
			this.animate();
		} else {

		}

		const styles = {
			container: {
				zIndex: 99,
				top: 0,
				left: 0,
				background: STYLE_CONST.YELLOW,
				position: 'absolute',
				width: '100%',
				height: '100%',
				display: 'flex',
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: this.props.width/7,
				fontFamily: STYLE_CONST.FONT_FAMILY,
				fontWeight: 300,
			}
		}
		return (
			<div style={styles.container}>
				<span>{DEFAULTS.Title.toUpperCase()}</span>
				<span>{this.state.timer}</span>
			</div>
		);
	}
}
export default SplashScreen;
