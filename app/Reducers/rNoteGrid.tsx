import { NOTE_GRID_BUTTON_TOGGLE } from '../Constants/ActionTypes';
import { Defaults } from '../Constants/Defaults'

interface IToggleState {
	isOn: boolean;
}

//TODO: Object.assign needs a polyfill

export const NoteGrid = (state = { isOn: Defaults.NoteGridButton }, action): IToggleState => {
	switch (action.type) {
		case NOTE_GRID_BUTTON_TOGGLE:
			//TODO: USe es7 spread when available in typescript
			//return {
			//	...state,
			//	isToggled: !state.isToggled,
			//}
			return Object.assign({}, state, { isOn: !state.isOn });
		default:
			return state;
	}
};
