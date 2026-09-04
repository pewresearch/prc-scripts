import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { Field, Form } from '@wordpress/dataviews';

import type { AudienceSnapshot, VerificationMode } from './types';

export const VERIFICATION_LABELS: Record<VerificationMode, string> = {
	verified: __('Verified', 'prc-platform-core'),
	unverified: __('Unverified', 'prc-platform-core'),
	all: __('All recipients', 'prc-platform-core'),
};

export type ReadOnlyField<Item> = Field<Item> & { readOnly: true };

export const AUDIENCE_FIELDS = [
	{
		id: 'count',
		label: __('Recipients', 'prc-platform-core'),
		type: 'integer',
		readOnly: true,
	},
	{
		id: 'verification',
		label: __('Verification', 'prc-platform-core'),
		type: 'text',
		readOnly: true,
		elements: Object.entries(VERIFICATION_LABELS).map(([value, label]) => ({
			value,
			label,
		})),
	},
	{
		id: 'builtAt',
		label: __('Built', 'prc-platform-core'),
		type: 'datetime',
		readOnly: true,
		render: ({ item, field }) => {
			if (item.builtAt === null) {
				return __('Not available', 'prc-platform-core');
			}
			return field.getValueFormatted({ item, field });
		},
	},
	{
		id: 'key',
		label: __('Key', 'prc-platform-core'),
		type: 'text',
		readOnly: true,
		render: ({ item }) =>
			createElement(
				'span',
				{
					className: 'prc-audience-build-panel__key',
					title: item.key,
				},
				item.key
			),
	},
	{
		id: 'scanned',
		label: __('Scanned', 'prc-platform-core'),
		type: 'integer',
		readOnly: true,
		getValue: ({ item }) => item.stats?.scanned,
		isVisible: (item) => item.stats?.scanned !== undefined,
	},
	{
		id: 'matched',
		label: __('Matched', 'prc-platform-core'),
		type: 'integer',
		readOnly: true,
		getValue: ({ item }) => item.stats?.matched,
		isVisible: (item) => item.stats?.matched !== undefined,
	},
	{
		id: 'v2Groups',
		label: __('V2 groups', 'prc-platform-core'),
		type: 'integer',
		readOnly: true,
		getValue: ({ item }) => item.stats?.v2Groups,
		isVisible: (item) => item.stats?.v2Groups !== undefined,
	},
] satisfies ReadOnlyField<AudienceSnapshot>[];

export const AUDIENCE_FORM = {
	layout: {
		type: 'regular',
		labelPosition: 'side',
	},
	fields: AUDIENCE_FIELDS.map(({ id }) => id),
} satisfies Form;

export function getAudienceFields() {
	return AUDIENCE_FIELDS;
}
