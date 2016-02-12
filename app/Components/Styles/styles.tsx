import * as React from 'react';

//TODO: find StyleSheet typings

export const STYLE_CONST: any = {
	TOP_PANEL_HEIGHT: 70,
	BORDER_WIDTH: 0,
	BOTTOM_PANEL_HEIGHT: 150,
	TITLE_FONT_SIZE: 34,
	SLIDER_FONT_SIZE: 28,
	YELLOW: 'rgb(211,198,101)',
	GREEN: 'rgb(76,126,130)',
	GREEN_VALUES: '76,126,130',
	BROWN: 'rgb(52,40,0)',
	WHITE: 'white',
	BLACK: 'black',
	PADDING: 5,
}

export const style: any = {
	title: {
		container: {
			display: 'block',
			float: 'left',
			height: STYLE_CONST.TOP_PANEL_HEIGHT,
		},
		h1: {
			fontSize: STYLE_CONST.TITLE_FONT_SIZE,
			lineHeight: `${STYLE_CONST.TOP_PANEL_HEIGHT}px`,
			margin: 0,
			marginLeft: 20,
			fontWeight: 300,
		},
	},
	recordPlayButtonGroup: {
		container: {
			display: 'inline-block',
			float: 'right',
			//marginLeft: 10,
			borderLeft: `${STYLE_CONST.BORDER_WIDTH}px solid black`,
		},
	},
	noteGuideButton: {
		container: {
			display: 'inline-block',
			float: 'right',
			//marginLeft: 10,
			borderLeft: `${STYLE_CONST.BORDER_WIDTH}px solid black`,
		},
	},
	waveformSelectGroup: {
		container: {
			display: 'inline-block',
			float: 'right',
			//marginLeft: 10,
			borderLeft: `${STYLE_CONST.BORDER_WIDTH}px solid black`,
		},
	},
	button: {
		backgroundColor: 'white',
		//TODO: Delete the border - use icons with whitespace, no outlines
		//border: `${STYLE_CONST.BORDER_WIDTH}px solid black`,
		lineHeight: `${STYLE_CONST.TOP_PANEL_HEIGHT}px`,
		textAlign: 'center',
		fontSize: 12,
		color: STYLE_CONST.BLACK,
		width: STYLE_CONST.TOP_PANEL_HEIGHT,
		height: STYLE_CONST.TOP_PANEL_HEIGHT,
		display: 'inline-block',
		cursor: 'pointer',
	},
	buttonActive: {
		color: STYLE_CONST.GREEN,
	},

	touchArea: {
		background: STYLE_CONST.YELLOW,
		cursor: 'pointer',
		border: `${STYLE_CONST.BORDER_WIDTH}px solid black`,
	},

	sliderGroup: {
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
		fontSize: STYLE_CONST.SLIDER_FONT_SIZE,
		lineHeight: `${STYLE_CONST.BOTTOM_PANEL_HEIGHT/3}px`,
		marginRight: 20,
		pointerEvents: 'none',
	}
};