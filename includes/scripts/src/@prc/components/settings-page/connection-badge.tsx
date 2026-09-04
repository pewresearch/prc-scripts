/* eslint-disable @wordpress/i18n-text-domain -- textDomain is supplied by consumer plugins */
import { __ } from '@wordpress/i18n';

import StatusDotBadge from '../status-dot-badge';
import type { ConnectionBadgeProps } from './types';

const CONNECTED_COLOR = '#00a32a';
const DISCONNECTED_COLOR = '#d63638';

export default function ConnectionBadge({
	connected,
	connectedLabel,
	disconnectedLabel,
	textDomain = 'default',
}: ConnectionBadgeProps) {
	return (
		<StatusDotBadge
			label={
				connected
					? (connectedLabel ?? __('Connected', textDomain))
					: (disconnectedLabel ?? __('Not connected', textDomain))
			}
			color={connected ? CONNECTED_COLOR : DISCONNECTED_COLOR}
		/>
	);
}
