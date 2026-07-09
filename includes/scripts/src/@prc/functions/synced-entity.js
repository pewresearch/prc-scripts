/**
 * Shared constants and helpers for synced-entity blocks (form, quiz, chart).
 */
import { sprintf } from '@wordpress/i18n';

export const EDIT_CONTEXT_QUERY = { context: 'edit' };

export const POLL_INTERVAL_MS = 60000;

export function entityRecordArgs(postType, ref) {
	return ['postType', postType, ref, EDIT_CONTEXT_QUERY];
}

export function presenceRoom(postType, ref) {
	return `postType/${postType}:${ref}`;
}

export function formatPresenceNoticeMessage(editors, { singular, plural }) {
	if (!editors?.length) {
		return null;
	}

	if (editors.length === 1) {
		return sprintf(singular, editors[0].displayName);
	}

	const names = editors.map((editor) => editor.displayName);
	const last = names.pop();

	return sprintf(plural, names.join(', '), last);
}
