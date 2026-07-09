/**
 * External Dependencies
 */
import { symbolFilled, Icon } from '@wordpress/icons';

export default function SyncedEntityIcon({ color = '#b8236d' }) {
	return (
		<Icon
			icon={symbolFilled}
			style={{
				color,
			}}
		/>
	);
}
