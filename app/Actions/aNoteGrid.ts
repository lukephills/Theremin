import { ActionType, NOTE_GRID_BUTTON_TOGGLE } from '../Constants/ActionTypes';

export interface INoteGridButtonAction {
	//TODO: Change to string enums when available
	//type: ACTIONTYPE;
	type: ActionType;
}

export function NoteGrid(): INoteGridButtonAction {
	return {
		type: NOTE_GRID_BUTTON_TOGGLE
	};
}
