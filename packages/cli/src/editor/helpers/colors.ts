export const BACKGROUND = '#1f2428';
export const INPUT_BACKGROUND = '#2f363d';
export const BORDER_COLOR = '#000';
export const LIGHT_COLOR = '#ddd';
export const SELECTED_BACKGROUND = 'hsla(0, 0%, 100%, 0.15)';
export const LIGHT_TEXT = 'rgba(255, 255, 255, 0.6)';
export const SELECTED_HOVER_BACKGROUND = 'hsla(0, 0%, 100%, 0.25)';
export const CLEAR_HOVER = 'rgba(255, 255, 255, 0.06)';
export const INPUT_BORDER_COLOR_UNHOVERED = 'rgba(0, 0, 0, 0.6)';
export const INPUT_BORDER_COLOR_HOVERED = 'rgba(255, 255, 255, 0.05)';

export const getBackgroundFromHoverState = ({
	selected,
	hovered,
}: {
	selected: boolean;
	hovered: boolean;
}) => {
	if (selected) {
		if (hovered) {
			return SELECTED_HOVER_BACKGROUND;
		}

		return SELECTED_BACKGROUND;
	}

	if (hovered) {
		return CLEAR_HOVER;
	}

	return 'transparent';
};
