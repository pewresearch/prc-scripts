import type { ReactNode } from 'react';

export function previewBody(
	textSlot: ReactNode | undefined,
	showEditableText: boolean,
	editable: ReactNode,
	fallback: ReactNode
): ReactNode {
	if (textSlot) {
		return textSlot;
	}
	if (showEditableText) {
		return editable;
	}
	return fallback;
}

export function showBodyChrome(
	textSlot: ReactNode | undefined,
	showEditableText: boolean,
	charLimit: number | undefined,
	isSelected: boolean
): boolean {
	return Boolean(
		(textSlot || showEditableText) && charLimit !== undefined && isSelected
	);
}
