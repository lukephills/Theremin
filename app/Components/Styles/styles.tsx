import * as React from 'react';

//TODO: find StyleSheet typings

export const STYLE_CONST: any = {
	TOP_PANEL_HEIGHT: 60,
	BORDER_WIDTH: 3,
	BOTTOM_PANEL_HEIGHT: 220,
}

export const style: any = {
	title: {
		container: {
			display: 'block',
			float: 'left',
			height: STYLE_CONST.TOP_PANEL_HEIGHT + (STYLE_CONST.BORDER_WIDTH * 2),
		},
		h1: {
			fontSize: 30,
			margin: 0,
		},
	},
	recordPlayButtonGroup: {
		container: {
			display: 'inline-block',
		},
	},
	noteGuideButton: {
		container: {
			display: 'inline-block',
		},
	},
	waveformSelectGroup: {
		container: {
			display: 'inline-block',
			float: 'right',
			outline: `${STYLE_CONST.BORDER_WIDTH}px solid black`,
		},
	},
	button: {
		backgroundColor: 'white',
		border: `${STYLE_CONST.BORDER_WIDTH}px solid black`,
		fontSize: 20,
		color: 'red',
		width: STYLE_CONST.TOP_PANEL_HEIGHT,
		height: STYLE_CONST.TOP_PANEL_HEIGHT,
		display: 'inline-block',
		cursor: 'pointer',
	},
	buttonActive: {
		color: 'green',
	},

	touchArea: {
		background: 'grey',
		cursor: 'pointer',
		outline: `${STYLE_CONST.BORDER_WIDTH}px solid black`,
	},

	sliderGroup: {
		marginTop: -1,
		cursor: 'pointer',
	},

	slider: {
		height: STYLE_CONST.BOTTOM_PANEL_HEIGHT/3,
	},

	sliderContainer: {
		height: STYLE_CONST.BOTTOM_PANEL_HEIGHT/3,
	},

	sliderToolTip: {
		position: 'absolute',
		zIndex: 10,
		right: 0,
		fontSize: 34,
		marginTop: 16,
		marginRight: 20,
		pointerEvents: 'none',
	}
};