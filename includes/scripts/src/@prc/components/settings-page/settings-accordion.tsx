import { useMemo } from '@wordpress/element';
import type { ReactNode } from 'react';
import { DataForm } from '@wordpress/dataviews';
import type { Field } from '@wordpress/dataviews';

import {
	badgeFieldId,
	contentFieldId,
	introFieldId,
} from './settings-field-utils';
import type { SettingsAccordionProps } from './types';

function ContentRender({ content }: { content: ReactNode }) {
	return (
		<div className="prc-settings__render-section-content">{content}</div>
	);
}

function BadgeRender({ badge }: { badge: ReactNode }) {
	return <>{badge}</>;
}

function IntroRender({ intro }: { intro: ReactNode }) {
	return <div className="prc-settings__section-intro">{intro}</div>;
}

type FormFieldChild =
	| string
	| { id: string; layout: { type: 'regular'; labelPosition: 'none' } };

function hiddenLayoutChild(id: string): FormFieldChild {
	return {
		id,
		layout: { type: 'regular', labelPosition: 'none' },
	};
}

export default function SettingsAccordion({
	slug,
	title,
	description,
	children,
	contentId,
	badge,
	intro,
	defaultOpen = true,
}: SettingsAccordionProps) {
	const resolvedSlug = slug ?? contentId ?? 'section';

	const dataFormFields = useMemo(() => {
		const syntheticFields: Field<Record<string, unknown>>[] = [];

		if (badge) {
			syntheticFields.push({
				id: badgeFieldId(resolvedSlug),
				type: 'text',
				readOnly: true,
				Edit: 'text',
				render: () => <BadgeRender badge={badge} />,
			});
		}

		if (intro) {
			syntheticFields.push({
				id: introFieldId(resolvedSlug),
				type: 'text',
				readOnly: true,
				Edit: 'text',
				render: () => <IntroRender intro={intro} />,
			});
		}

		syntheticFields.push({
			id: contentFieldId(resolvedSlug),
			type: 'text',
			readOnly: true,
			Edit: 'text',
			render: () => <ContentRender content={children} />,
		});

		return syntheticFields;
	}, [badge, children, intro, resolvedSlug]);

	const formFieldChildren = useMemo(() => {
		const layoutChildren: FormFieldChild[] = [];

		if (intro) {
			layoutChildren.push(hiddenLayoutChild(introFieldId(resolvedSlug)));
		}

		layoutChildren.push(hiddenLayoutChild(contentFieldId(resolvedSlug)));

		return layoutChildren;
	}, [intro, resolvedSlug]);

	const cardGroup = useMemo(
		() => ({
			id: resolvedSlug,
			label: title,
			description,
			layout: {
				type: 'card' as const,
				withHeader: true as const,
				isCollapsible: true,
				isOpened: defaultOpen,
				...(badge
					? {
							summary: [
								{
									id: badgeFieldId(resolvedSlug),
									visibility: 'always' as const,
								},
							],
						}
					: {}),
			},
			children: formFieldChildren,
		}),
		[
			badge,
			defaultOpen,
			description,
			formFieldChildren,
			resolvedSlug,
			title,
		]
	);

	return (
		<div className="prc-settings__render-section" id={contentId}>
			<DataForm
				data={{}}
				fields={dataFormFields}
				form={{
					layout: { type: 'card' },
					fields: [cardGroup],
				}}
				onChange={() => {}}
			/>
		</div>
	);
}
