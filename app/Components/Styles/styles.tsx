import * as React from 'react';
require('./styles.css');

const Prefixer  = require('inline-style-prefixer');
export const prefixer = new Prefixer();

export const statusBarHeight = () => {
	if (window.cordova && cordova.platformId === 'ios' &&
		(window.orientation === 0 || window.orientation === 180)) {
		return 20;
	} else {
		return 0;
	}
}

export const STYLE_CONST: any = prefixer.prefix({
	TOP_PANEL_HEIGHT: 80,
	TOP_PANEL_HEIGHT_MOBILE_LANDSCAPE: 60,
	STATUS_BAR_HEIGHT: statusBarHeight(),
	BORDER_WIDTH: 0,
	BOTTOM_PANEL_HEIGHT: 150,
	BOTTOM_PANEL_HEIGHT_MOBILE: 120,
	TITLE_FONT_SIZE: 34,
	TITLE_FONT_SIZE_MED: 24,
	TITLE_FONT_SIZE_SML: 16,
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
		marginTop: statusBarHeight(),
		height: `${STYLE_CONST.TOP_PANEL_HEIGHT}px`,
		display: `flex`,
		flexDirection: 'row',
	},
	topPanel_mobileLandscape: {
		height: `${STYLE_CONST.TOP_PANEL_HEIGHT_MOBILE_LANDSCAPE}px`,
	},
	title: {
		container: {
			flexGrow: 11,
			height: STYLE_CONST.TOP_PANEL_HEIGHT,
		},
		container_mobileLandscape: {
			height: STYLE_CONST.TOP_PANEL_HEIGHT_MOBILE_LANDSCAPE,
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

	slider_smallScreen: {
		height: STYLE_CONST.BOTTOM_PANEL_HEIGHT_MOBILE/3,
	},

	sliderContainer: {
		height: STYLE_CONST.BOTTOM_PANEL_HEIGHT/3,
	},
	
	sliderContainer_smallScreen: {
		height: STYLE_CONST.BOTTOM_PANEL_HEIGHT_MOBILE/3,
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
	
	sliderToolTip_smallScreen: {
		lineHeight: `${STYLE_CONST.BOTTOM_PANEL_HEIGHT_MOBILE/3}px`,
	},

	downloadModal: {
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
			textAlign: 'center',
			fontSize: 46,
			fontWeight: 400,
			lineHeight: '46px',
			marginBottom: 10,
			textTransform: 'uppercase',
		},
		title_mobile: {
			fontSize: 34,
			lineHeight: '34px',
			marginBottom: 8,
		},
		title_mobileLandscape: {
			marginBottom: 0,
		},
		subtitle: {
			display:'flex',
			justifyContent: 'center',
			fontSize: 18,
		},
		subtitle_mobile: {
			fontSize: 14,
		},
		input: {
			display:'flex',
			justifyContent: 'center',
			fontSize: 42,
			border: 'none',
			background: 'transparent',
			color: STYLE_CONST.WHITE,
			borderBottom: `3px solid ${STYLE_CONST.WHITE}`,
			margin: '40px 0',
			textAlign: 'center',
			width: '100%',
			MozUserSelect: 'text',
			MSUserSelect: 'text',
			WebkitUserSelect: 'text',
			userSelect: 'text',
		},
		input_mobile: {
			fontSize: 32,
			margin: '30px 0',
		},
		button: {
			display:'flex',
			justifyContent: 'center',
			textAlign: 'center',
			fontSize: 36,
			fontWeight: 400,
			border: `3px solid ${STYLE_CONST.WHITE}`,
			padding: 10,
			':hover': {
				background: STYLE_CONST.WHITE,
				color: STYLE_CONST.GREEN,
			},
		},
		button_mobile: {
			fontSize: 28,
			padding: 8,
		}
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
	}
});