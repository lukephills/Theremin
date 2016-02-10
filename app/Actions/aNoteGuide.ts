import { ActionType, NOTE_GUIDE_BUTTON_TOGGLE } from '../Constants/ActionTypes';

export interface INodeGuideButtonAction {
	//TODO: Change to string enums when available
	//type: ACTIONTYPE;
	type: ActionType;
}

export function NoteGuide(): INodeGuideButtonAction {
	return {
		type: NOTE_GUIDE_BUTTON_TOGGLE
	};
}
