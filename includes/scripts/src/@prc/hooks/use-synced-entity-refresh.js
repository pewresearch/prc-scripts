/**
 * WordPress Dependencies
 */
import { useEffect } from '@wordpress/element';

/**
 * Internal Dependencies
 */
import { POLL_INTERVAL_MS } from '@prc/functions';

export default function useSyncedEntityRefresh({
	enabled,
	isOccupied,
	invalidate,
}) {
	useEffect(() => {
		if (!enabled || !isOccupied) {
			return undefined;
		}

		const interval = setInterval(invalidate, POLL_INTERVAL_MS);

		return () => {
			clearInterval(interval);
			invalidate();
		};
	}, [enabled, isOccupied, invalidate]);

	useEffect(() => {
		if (!enabled) {
			return undefined;
		}

		const handleVisibilityChange = () => {
			if (!document.hidden) {
				invalidate();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener(
				'visibilitychange',
				handleVisibilityChange
			);
		};
	}, [enabled, invalidate]);
}
