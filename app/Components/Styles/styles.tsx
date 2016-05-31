import * as React from 'react';
require('./fonts/fonts.css');
require('./styles.css');

const Prefixer  = require('inline-style-prefixer');
export const prefixer = new Prefixer();

// export const statusBarHeight = () => {
// 	if (window.cordova && cordova.platformId === 'ios' &&
// 		(window.orientation === 0 || window.orientation === 180)) {
// 		return 20;
// 	} else {
// 		return 0;
// 	}
// }

export const STYLE_CONST: any = prefixer.prefix({
	TOP_PANEL_HEIGHT: 80,
	TOP_PANEL_HEIGHT_MOBILE_LANDSCAPE: 60,
	TOP_PANEL_HEIGHT_LARGE: 120,
	STATUS_BAR_HEIGHT: 0,
	BORDER_WIDTH: 0,
	BOTTOM_PANEL_HEIGHT: 150,
	BOTTOM_PANEL_HEIGHT_MOBILE: 120,
	BOTTOM_PANEL_HEIGHT_LARGE: 240,
	TITLE_FONT_SIZE: 34,
	TITLE_FONT_SIZE_MED: 24,
	TITLE_FONT_SIZE_SML: 16,
	TITLE_FONT_SIZE_LRG: 48,
	SLIDER_FONT_SIZE: 28,
	SLIDER_FONT_SIZE_LRG: 36,
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
		marginTop: 0,
		height: `${STYLE_CONST.TOP_PANEL_HEIGHT}px`,
		display: `flex`,
		flexDirection: 'row',
	},
	topPanel_mobileLandscape: {
		height: `${STYLE_CONST.TOP_PANEL_HEIGHT_MOBILE_LANDSCAPE}px`,
	},
	topPanel_large: {
		height: `${STYLE_CONST.TOP_PANEL_HEIGHT_LARGE}px`,
	},
	title: {
		container: {
			flexGrow: 1,
			height: STYLE_CONST.TOP_PANEL_HEIGHT,
		},
		container_mobileLandscape: {
			height: STYLE_CONST.TOP_PANEL_HEIGHT_MOBILE_LANDSCAPE,
		},
		container_large: {
			height: STYLE_CONST.TOP_PANEL_HEIGHT_LARGE,
		},
		container_mobile: {
			position: 'absolute',
		},
		h1: {
			margin: 0,
			marginLeft: 15,
			color: STYLE_CONST.BLACK,
			fontFamily: STYLE_CONST.FONT_FAMILY,
			fontWeight: 400,
			fontSize: STYLE_CONST.TITLE_FONT_SIZE,
			lineHeight: `${STYLE_CONST.TOP_PANEL_HEIGHT}px`,
			cursor: 'default',
		},
		h1_mobileSizeLarge: {
			fontSize: STYLE_CONST.TITLE_FONT_SIZE_MED,
			marginLeft: 3,
		},
		h1_mobileSizeSmall: {
			fontSize: STYLE_CONST.TITLE_FONT_SIZE_SML,
			lineHeight: 2,
		},
		h1_mobileLandscape: {
			lineHeight: `${STYLE_CONST.TOP_PANEL_HEIGHT_MOBILE_LANDSCAPE}px`,
		},
		h1_large: {
			lineHeight: `${STYLE_CONST.TOP_PANEL_HEIGHT_LARGE}px`,
			fontSize: STYLE_CONST.TITLE_FONT_SIZE_LRG,
			marginLeft: 32,
		}
	},
	recordPlayButtonGroup: {
		container: {
			flexGrow: 1,
			display: `flex`,
			justifyContent: 'space-around',
			zIndex: 1,
			marginLeft: 0,
		},
		container_mobile: {
			paddingTop: 18,
			marginLeft: -8,
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
			marginLeft: 0,
			marginRight: 0,
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

	slider_small: {
		height: STYLE_CONST.BOTTOM_PANEL_HEIGHT_MOBILE/3,
	},

	slider_large: {
		height: STYLE_CONST.BOTTOM_PANEL_HEIGHT_LARGE/3,
	},

	sliderContainer: {
		height: STYLE_CONST.BOTTOM_PANEL_HEIGHT/3,
	},
	
	sliderContainer_small: {
		height: STYLE_CONST.BOTTOM_PANEL_HEIGHT_MOBILE/3,
	},

	sliderContainer_large: {
		height: STYLE_CONST.BOTTOM_PANEL_HEIGHT_LARGE/3,
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
	
	sliderToolTip_small: {
		lineHeight: `${STYLE_CONST.BOTTOM_PANEL_HEIGHT_MOBILE/3}px`,
	},

	sliderToolTip_large: {
		lineHeight: `${STYLE_CONST.BOTTOM_PANEL_HEIGHT_LARGE/3}px`,
		fontSize: STYLE_CONST.SLIDER_FONT_SIZE_LRG,
	},

	downloadModal: {
		overlay: {
			zIndex: 99,
			display: 'flex',
		},
		content: {
			position: 'relative',
			background: STYLE_CONST.WHITE,
			color: STYLE_CONST.BLACK,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			border: '1px solid #f4f4f4',
			borderRadius: 0,
			fontFamily: STYLE_CONST.FONT_FAMILY,
		},
		content_large: {
			padding: 40,
		},
		title: {
			display:'flex',
			justifyContent: 'center',
			textAlign: 'center',
			fontSize: 22,
			fontWeight: 400,
			padding: 20,
		},
		button: {
			display:'flex',
			textAlign: 'center',
			fontSize: 22,
			lineHeight: '50px',
			fontWeight: 300,
			border: 'none',
			background: `rgba(${STYLE_CONST.GREEN_VALUES},${0.6})`,
			width: '44%',
			marginTop: 14,
		},
		buttonContainer: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-around',
		},
	},

	startModal: {
		overlay: {
			zIndex: 100,
		},
		content: {
			background: STYLE_CONST.YELLOW,
			color: STYLE_CONST.BLACK,
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
			marginBottom: 20,
			textTransform: 'uppercase',
		},
		subtitle: {
			display:'flex',
			justifyContent: 'center',
			fontSize: 18,
			marginBottom: 40,
		},
		button: {
			display:'flex',
			justifyContent: 'center',
			textAlign: 'center',
			fontSize: '36px',
			fontWeight: 400,
			border: `2px solid ${STYLE_CONST.BLACK}`,
			padding: 10,
			paddingLeft: 100,
			paddingRight: 100,
			minWidth: 250,
			cursor: 'pointer',
		},
		buttonPressed: {
			background: STYLE_CONST.BLACK,
			color: STYLE_CONST.WHITE,
		}
	}
});