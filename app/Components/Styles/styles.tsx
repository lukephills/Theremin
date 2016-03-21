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
	GREY: 'rgba(50,50,50,0.5)',
	YELLOW: '#fff997',
	GREEN: 'rgb(114,193,165)',
	RED: '#df6c57',
	GREEN_VALUES: '114,193,165',
	PADDING: 5,
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
			fontSize: STYLE_CONST.TITLE_FONT_SIZE,
			lineHeight: `${STYLE_CONST.TOP_PANEL_HEIGHT}px`,
			margin: 0,
			marginLeft: 15, //TODO: move title left a bit and waveforms in a bit
			fontWeight: 400,
			color: STYLE_CONST.BLACK,
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
		fontSize: STYLE_CONST.SLIDER_FONT_SIZE,
		lineHeight: `${STYLE_CONST.BOTTOM_PANEL_HEIGHT/3}px`,
		marginRight: 15,
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
		},
		title: {
			display:'flex',
			justifyContent: 'center',
			fontSize: STYLE_CONST.TITLE_FONT_SIZE,
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
			fontSize: '36px',
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
			fontSize: '28px',
			border: `3px solid ${STYLE_CONST.WHITE}`,
			padding: 10,
			':hover': {
				background: STYLE_CONST.WHITE,
				color: STYLE_CONST.GREEN,
			},
		},
	}
});