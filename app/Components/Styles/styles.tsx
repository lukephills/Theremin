import * as React from 'react';

//TODO: find StyleSheet typings
export const styles: any = {
	button: {
		backgroundColor: 'white',
		border: '2px solid black',
		fontSize: 20,
		color: 'red',
		width: 50,
		height: 50,
		display: 'inline-block',
	},
	buttonActive: {
		color: 'green',
	},

	sliderToolTip: {
		position: 'absolute',
		zIndex: 10,
		right: 0,
		fontSize: 40,
		marginTop: 16,
		marginRight: 20,
		pointerEvents: 'none',
	}
};