import TouchEvent = __React.TouchEvent;
import EventHandler = __React.EventHandler;
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



export interface ICoordinates {
	x: number;
	y: number;
}


export function numberWithinRange(num: number, min: number,max: number): number {
	num = num > max ? max : num;
	num = num < min ? min : num;
	return num;
}

export function getPercentagePosition(e: any): ICoordinates {
	const _round = require('lodash/round');
	let x = numberWithinRange(_round(((e.pageX - e.target.offsetLeft) / e.target.offsetWidth) * 100, 2), 0, 100);
	let y = numberWithinRange(_round((100 - ((e.pageY - e.target.offsetTop) / e.target.offsetHeight) * 100), 2), 0, 100);
	return {x, y}
}

export function hitTest(x: number, y: number, targetX: number, targetY: number, targetWidth: number, targetHeight: number) {
	return (
		x >= targetX &&
		x <= targetX + targetWidth &&
		y >= targetY &&
		y <= targetY + targetHeight
	);
}