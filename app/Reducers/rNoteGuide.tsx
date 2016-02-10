import { NOTE_GUIDE_BUTTON_TOGGLE } from '../Constants/ActionTypes';
import { Defaults } from '../Constants/Defaults'

interface IToggleState {
	isOn: boolean;
}

//TODO: Object.assign needs a polyfill

export const NoteGuide = (state = { isOn: Defaults.NoteGuideButton }, action): IToggleState => {
	switch (action.type) {
		case NOTE_GUIDE_BUTTON_TOGGLE:
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
