/**
 * WordPress Dependencies
 */
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * External Dependencies
 */
import { usePresenceUsers } from '@presence-api/src';

/**
 * Internal Dependencies
 */
import { presenceRoom } from '@prc/functions';
import { isPresenceApiEnabled } from './presence-utils';

export default function useEntityPresence(
	postType,
	ref,
	{ debug = false } = {}
) {
	const room =
		ref && isPresenceApiEnabled() ? presenceRoom(postType, ref) : null;

	const currentUserId = useSelect(
		(select) => select('core').getCurrentUser()?.id,
		[]
	);

	const { isPresent, users } = usePresenceUsers(room, {
		includeSelf: true,
	});

	const editors = users.filter((user) => user.id !== currentUserId);
	const isBeingEdited = editors.length > 0;

	useEffect(() => {
		if (!debug || !ref) {
			return;
		}
		// eslint-disable-next-line no-console
		console.log(`[${debug}] room state`, {
			ref,
			room,
			isOccupied: isPresent,
			isBeingEdited,
			editorCount: editors.length,
			editors: editors.map((user) => ({
				id: user.id,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
			})),
		});
	}, [debug, ref, room, isPresent, isBeingEdited, editors]);

	return {
		isBeingEdited,
		editors,
		isOccupied: isPresent,
	};
}
