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

/**
 * Object assign polyfill
 */
export function objectAssignPolyfill() {
	if (typeof Object.assign != 'function') {
		(function () {
			Object.assign = function (target) {
				'use strict';
				if (target === undefined || target === null) {
					throw new TypeError('Cannot convert undefined or null to object');
				}

				var output = Object(target);
				for (var index = 1; index < arguments.length; index++) {
					var source = arguments[index];
					if (source !== undefined && source !== null) {
						for (var nextKey in source) {
							if (source.hasOwnProperty(nextKey)) {
								output[nextKey] = source[nextKey];
							}
						}
					}
				}
				return output;
			};
		})();
	}
}
