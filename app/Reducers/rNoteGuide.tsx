import { NOTE_GUIDE_TOGGLE } from '../Constants/ActionTypes';
import { Defaults } from '../Constants/Defaults'

interface IToggleState {
	isOn: boolean;
}

export const NoteGuide = (state = { isOn: Defaults.NoteGuideButton }, action): IToggleState => {
	switch (action.type) {
		case NOTE_GUIDE_TOGGLE:
			return Object.assign({}, state, { isOn: !state.isOn });
		default:
			return state;
	}
};
