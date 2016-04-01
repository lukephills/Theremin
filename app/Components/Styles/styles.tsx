import * as React from 'react';

const Prefixer  = require('inline-style-prefixer');
export const prefixer = new Prefixer();

export const STYLE_CONST: any = prefixer.prefix({
	TOP_PANEL_HEIGHT: 70,
	BORDER_WIDTH: 0,
	BOTTOM_PANEL_HEIGHT: 150,
	TITLE_FONT_SIZE: 34,
	SLIDER_FONT_SIZE: 28,
	WHITE: 'white',
	BLACK: '#444',
	GREY: 'rgba(50,50,50,0.4)',
	YELLOW: '#fff997',
	GREEN: 'rgb(114,193,165)',
	RED: '#df6c57',
	GREEN_VALUES: '114,193,165',
	PADDING: 5,
	FONT_FAMILY: 'Lato, sans-serif',
})

export const STYLE: any = prefixer.prefix({
	topPanel: {
		height: `${STYLE_CONST.TOP_PANEL_HEIGHT}px`,
		display: `flex`,
		flexDirection: 'row',
	},
	title: {
		container: {
			flexGrow: 11,
			height: STYLE_CONST.TOP_PANEL_HEIGHT,
		},
		container_mobile: {
			position: 'absolute',
		},
		h1: {
			margin: 0,
			marginLeft: 15, //TODO: move title left a bit and waveforms in a bit
			color: STYLE_CONST.BLACK,
			fontFamily: STYLE_CONST.FONT_FAMILY,
			fontWeight: 400,
			fontSize: STYLE_CONST.TITLE_FONT_SIZE,
			lineHeight: `${STYLE_CONST.TOP_PANEL_HEIGHT}px`,
		},
		h1_mobile: {
			fontSize: 16,
			lineHeight: 2,
			marginLeft: 3,
		}
	},
	recordPlayButtonGroup: {
		container: {
			flexGrow: 1,
			display: `flex`,
			justifyContent: 'space-around',
			zIndex: 1,
		},
		container_mobile: {
			paddingTop: 18,
		}
	},

	waveformSelectGroup: {
		container: {
			marginLeft: '4vw',
			marginRight: 10,
			flexGrow: 1,
			display: `flex`,
			justifyContent: 'space-around',
		},
		container_mobile: {
			paddingTop: 18,
		}
	},

	button: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		cursor: 'pointer',
	},
	buttonActive: {
		color: STYLE_CONST.GREEN,
	},
	buttonDisabled: {
		cursor: 'initial',
	},
	touchArea: {
		background: STYLE_CONST.YELLOW,
		cursor: 'pointer',
		border: `${STYLE_CONST.BORDER_WIDTH}px solid ${STYLE_CONST.BLACK}`,
	},

	canvas: {
		barWidth: 10,
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
		marginRight: 15,
		fontSize: STYLE_CONST.SLIDER_FONT_SIZE,
		fontFamily: STYLE_CONST.FONT_FAMILY,
		fontWeight: 300,
		lineHeight: `${STYLE_CONST.BOTTOM_PANEL_HEIGHT/3}px`,
		pointerEvents: 'none',
		color: STYLE_CONST.BLACK,
	},

	recordOverlay: {
		overlay: {
			zIndex: 99,
		},
		content: {
			background: STYLE_CONST.GREEN,
			color: STYLE_CONST.WHITE,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			border: 0,
			borderRadius: 0,
			fontFamily: STYLE_CONST.FONT_FAMILY,
		},
		title: {
			display:'flex',
			justifyContent: 'center',
			fontSize: STYLE_CONST.TITLE_FONT_SIZE + 10,
			fontWeight: 400,
			lineHeight: `${STYLE_CONST.TITLE_FONT_SIZE}px`,
			marginBottom: 10,
			textTransform: 'uppercase',
		},
		subtitle: {
			display:'flex',
			justifyContent: 'center',
			fontSize: '18px',
		},
		input: {
			display:'flex',
			justifyContent: 'center',
			fontSize: '42px',
			border: 'none',
			background: 'transparent',
			color: STYLE_CONST.WHITE,
			borderBottom: `3px solid ${STYLE_CONST.WHITE}`,
			margin: '40px 0',
			textAlign: 'center',
			width: '100%',
		},
		button: {
			display:'flex',
			justifyContent: 'center',
			textAlign: 'center',
			fontSize: '36px',
			fontWeight: 400,
			border: `3px solid ${STYLE_CONST.WHITE}`,
			padding: 10,
			':hover': {
				background: STYLE_CONST.WHITE,
				color: STYLE_CONST.GREEN,
			},
		},
	}
});