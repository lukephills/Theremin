import * as React from 'react';
import { connect } from 'react-redux';
import { Waveform } from '../Actions/actions';
import {Defaults, WAVEFORMS} from '../Constants/Defaults';
import ToggleButton from './ToggleButton';
import Canvas from './Canvas';
import { IGlobalState } from '../Constants/GlobalState';

interface IProps {
	dispatch?: Function;
	style?: any;
	waveform?: string;
	waveformChange(waveform: string): void;
}

interface IState {
	waveform: any;
}

function select(state: IGlobalState): any {
	return {
		waveform: state.Waveform.wave
	};
}

@connect(select)
class WaveformSelectGroup extends React.Component<IProps, IState> {

	constructor(props){
		super(props);
		this.onButtonClick = this.onButtonClick.bind(this)
	}

	public render(): React.ReactElement<{}> {
		return (
			<div style={this.props.style}>
				{WAVEFORMS.map((waveform: string, id: number) => {
					return (
						<ToggleButton
							id={waveform}
							isOn={waveform === this.props.waveform}
							onDown={(e) => this.onButtonClick(e, waveform)}
							key={id}>
							<Canvas
								height={50}
							    width={50}
							    draw={this.draw}
							    options={{waveform}}
							/>
						</ToggleButton>
					);
				})}
			</div>
		);
	}

	public draw(ctx: CanvasRenderingContext2D, width: number, height: number, options: any) {
		var units = width/22;
		var cx = width/2;
		var cy = height/2;
		ctx.lineWidth = Math.floor(width/12);

		switch (options.waveform) {
			case 'sine':
				ctx.beginPath();
				ctx.moveTo(cx - (10*units), cy - (5*units));
				ctx.bezierCurveTo(cx + (2.5*units), cy - (5*units),cx - (2.5*units), cy + (5*units),cx + (10*units), cy + (5*units));
				ctx.stroke();
				break;

			case 'square':
				ctx.moveTo(cx - (10*units), cy - (5*units));
				ctx.lineTo(cx, cy - (5*units));
				ctx.lineTo(cx, cy + (5*units));
				ctx.lineTo(cx + (10*units), cy + (5*units));
				ctx.stroke();
				break;

			case 'triangle':
				ctx.moveTo(cx - (15*units), cy + (5*units));
				ctx.lineTo(cx - (5*units), cy - (5*units));
				ctx.lineTo(cx + (5*units), cy + (5*units));
				ctx.lineTo(cx + (15*units), cy - (5*units));
				ctx.stroke();
				break;

			case 'sawtooth':
				ctx.moveTo(cx - (10*units), cy + (5*units));
				ctx.lineTo(cx, cy - (5*units));
				ctx.lineTo(cx, cy + (5*units));
				ctx.lineTo(cx + (10*units), cy - (5*units));
				ctx.lineTo(cx + (10*units), cy + (5*units));
				ctx.stroke();
				break;
		}


	}

	private onButtonClick(e, waveform: string) {
		e.preventDefault();
		this.props.waveformChange(waveform);
		this.props.dispatch(Waveform(waveform));
	}
}
export default WaveformSelectGroup;
