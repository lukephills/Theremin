import * as CanvasUtils from '../Utils/CanvasUtils';
import {RecordStateType} from '../Constants/AppTypings';

export interface ISpectrumOptions {
	color?: string;
	isActive?: boolean;
	recordState?: RecordStateType
}

class Spectrum {

	private canvas: HTMLCanvasElement;
	private pixelRatio: number;
	private analyserNode: AnalyserNode;
	private defaultOptions: ISpectrumOptions = {
		color: 'black',
		isActive: true,
	};

	constructor(canvas: HTMLCanvasElement, analyserNode: AnalyserNode) {
		this.canvas = canvas;
		this.analyserNode = analyserNode;
		this.pixelRatio = CanvasUtils.getPixelRatio();
	}

	public Draw(options: ISpectrumOptions = this.defaultOptions): void {
		if (options.isActive) {
			//TODO reset magnitudes back to 0 on stop playback
			const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
			const pixelRatio: number = this.pixelRatio;
			const width: number = this.canvas.width / pixelRatio;
			const height: number = this.canvas.height / pixelRatio;
			const barWidth: number = 6;
			const maxHeight: number = height - 2;
			const barSpacing: number = 9;

			// Calculate number of bars needed to fill canvas width
			const barCount: number = (width / (barSpacing + barWidth));
			const maxMag: number = 255;

			const freqByteData: Uint8Array = new Uint8Array(this.analyserNode.frequencyBinCount);
			this.analyserNode.getByteFrequencyData(freqByteData);

			ctx.fillStyle = options.color;
			for (let i: number = 0; i < barCount; i++) {
				// Calculate the magnitude based on byte data and max bar height
				const magnitude: number = freqByteData[i] / (maxMag / maxHeight);
				ctx.fillRect((barWidth + barSpacing) * i, height, barWidth, -magnitude);
			}
		}
	}
}
export default Spectrum;
