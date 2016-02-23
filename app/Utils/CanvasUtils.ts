/**
 * Gets the devices pixel ratio
 * @type {number}
 */
export function getPixelRatio(): number {
	return window.devicePixelRatio;
}

/**
 * Resize the canvas using the devices pixel ratio
 * @param canvas
 * @param width
 * @param height
 * @returns {HTMLCanvasElement}
 */
export function canvasResize(canvas: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
	const ratio: number = getPixelRatio();
	canvas.width = width * ratio;
	canvas.height = height * ratio;
	canvas.style.width = width + 'px';
	canvas.style.height = height + 'px';
	canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
	return canvas;
}

/**
 * Creates a device pixel ratio canvas
 * @param width
 * @param height
 * @returns {HTMLCanvasElement}
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
	const canvas: HTMLCanvasElement = document.createElement('canvas');
	return canvasResize(canvas, width, height);
}
