/**
 * WordPress Dependencies
 */
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal Dependencies
 */
import { presenceRoom } from '@prc/functions';
import usePresenceUsers from './use-presence-users';

export default function useEntityPresence(
	postType,
	ref,
	{ debug = false } = {}
) {
	const room = ref ? presenceRoom(postType, ref) : null;

	const currentUserId = useSelect(
		(select) => select('core').getCurrentUser()?.id,
		[]
	);

	const { isPresent, users } = usePresenceUsers(room, {
		includeSelf: true,
		debug,
	});

	const editors = users.filter((user) => user.userId !== currentUserId);
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
				userId: user.userId,
				displayName: user.displayName,
				data: user.data,
			})),
		});
	}, [debug, ref, room, isPresent, isBeingEdited, editors]);

	return {
		isBeingEdited,
		editors,
		isOccupied: isPresent,
	};
}
