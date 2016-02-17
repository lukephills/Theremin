// Empty function
export const noOp: any = () => {}

/**
 * Gets the devices pixel ratio
 * @type {number}
 */
export const getPixelRatio = () => {return window.devicePixelRatio }


export const createCanvas = (w: number, h: number, ratio: number = getPixelRatio()) => {
	var canvas: HTMLCanvasElement = document.createElement("canvas");
	return canvasResize(canvas, w, h);
}

export const canvasResize = (canvas: HTMLCanvasElement, w: number, h: number) => {
	const ratio: number = getPixelRatio();
	canvas.width = w * ratio;
	canvas.height = h * ratio;
	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
	canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
	return canvas;
}
