/* eslint-disable @wordpress/i18n-text-domain -- textDomain is supplied by consumer plugins */
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import type { ReactNode } from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { DataForm } from '@wordpress/dataviews';
import type { Field } from '@wordpress/dataviews';
import { store as noticesStore } from '@wordpress/notices';

import { useSettingsPageContext } from './settings-page-context';
import {
	annotationFieldId,
	badgeFieldId,
	buildFormDataFromFields,
	findChangedFieldId,
	footerFieldId,
	getValueByPath,
	introFieldId,
	isSyntheticFieldId,
	mergeDraftValuesIntoFormData,
	parseFieldValuesFromForm,
	setValueByPath,
	toDataFormField,
} from './settings-field-utils';
import type { SettingsFieldConfig, SettingsFieldsSectionProps } from './types';

const DEBOUNCE_MS = 800;

function isImmediateSaveField(field: SettingsFieldConfig): boolean {
	return (
		field.type === 'boolean' ||
		field.type === 'select' ||
		field.autoSave === true
	);
}

function IntroRender({ intro }: { intro: ReactNode }) {
	return <div className="prc-settings__section-intro">{intro}</div>;
}

function BadgeRender({ badge }: { badge: ReactNode }) {
	return <>{badge}</>;
}

function AnnotationRender({ annotation }: { annotation: ReactNode }) {
	return <div className="prc-settings__field-annotation">{annotation}</div>;
}

function FooterRender({ footer }: { footer: ReactNode }) {
	return <div className="prc-settings__section-footer">{footer}</div>;
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

export default function SettingsFieldsSection({
	slug,
	title,
	description,
	fields,
	intro,
	badge,
	footer,
	defaultOpen = true,
}: SettingsFieldsSectionProps) {
	const { store, saveSettings, textDomain } = useSettingsPageContext();
	const settings = useSelect(
		(sel) => sel(store).getSettings() as Record<string, unknown>,
		[store]
	);
	const { applyPatch } = useDispatch(store);
	const { createErrorNotice } = useDispatch(noticesStore);

	const debouncedFieldIds = useMemo(
		() =>
			fields
				.filter((field) => !isImmediateSaveField(field))
				.map((f) => f.id),
		[fields]
	);

	const storedFormData = useMemo(
		() => buildFormDataFromFields(settings, fields),
		[fields, settings]
	);

	const [pendingValues, setPendingValues] = useState<Record<string, unknown>>(
		{}
	);
	const debounceTimersRef = useRef<
		Record<string, ReturnType<typeof setTimeout>>
	>({});
	const formDataRef = useRef(storedFormData);

	const formData = useMemo(
		() => mergeDraftValuesIntoFormData(storedFormData, pendingValues),
		[storedFormData, pendingValues]
	);
	formDataRef.current = formData;

	useEffect(() => {
		setPendingValues((currentPending) => {
			const nextPending = { ...currentPending };
			let changed = false;

			for (const fieldId of debouncedFieldIds) {
				if (
					nextPending[fieldId] !== undefined &&
					getValueByPath(storedFormData, fieldId) ===
						nextPending[fieldId]
				) {
					delete nextPending[fieldId];
					changed = true;
				}
			}

			return changed ? nextPending : currentPending;
		});
	}, [debouncedFieldIds, storedFormData]);

	const persistField = useCallback(
		async (field: SettingsFieldConfig, value: unknown) => {
			const parsedValues = parseFieldValuesFromForm(
				settings,
				setValueByPath({}, field.id, value),
				[field]
			);

			applyPatch(parsedValues);

			const successMessage =
				field.type === 'boolean'
					? sprintf(
							value
								? __('%s enabled.', textDomain)
								: __('%s disabled.', textDomain),
							field.label
						)
					: sprintf(__('%s updated.', textDomain), field.label);

			try {
				await saveSettings({ successMessage });
				setPendingValues((currentPending) => {
					if (currentPending[field.id] === undefined) {
						return currentPending;
					}

					const nextPending = { ...currentPending };
					delete nextPending[field.id];
					return nextPending;
				});
			} catch (saveError) {
				createErrorNotice(
					saveError instanceof Error
						? saveError.message
						: __('Unable to save setting.', textDomain),
					{ type: 'snackbar' }
				);
			}
		},
		[applyPatch, createErrorNotice, saveSettings, settings, textDomain]
	);

	const scheduleDebouncedSave = useCallback(
		(field: SettingsFieldConfig, value: unknown) => {
			setPendingValues((currentPending) => ({
				...currentPending,
				[field.id]: value,
			}));

			if (debounceTimersRef.current[field.id]) {
				clearTimeout(debounceTimersRef.current[field.id]);
			}

			debounceTimersRef.current[field.id] = setTimeout(() => {
				void persistField(field, value);
				delete debounceTimersRef.current[field.id];
			}, DEBOUNCE_MS);
		},
		[persistField]
	);

	const dataFormFields = useMemo(() => {
		const syntheticFields: Field<Record<string, unknown>>[] = [];

		if (badge) {
			syntheticFields.push({
				id: badgeFieldId(slug),
				type: 'text',
				readOnly: true,
				Edit: 'text',
				render: () => <BadgeRender badge={badge} />,
			});
		}

		if (intro) {
			syntheticFields.push({
				id: introFieldId(slug),
				type: 'text',
				readOnly: true,
				Edit: 'text',
				render: () => <IntroRender intro={intro} />,
			});
		}

		for (const field of fields) {
			const annotation = field.annotation?.();
			if (annotation) {
				syntheticFields.push({
					id: annotationFieldId(field.id),
					type: 'text',
					readOnly: true,
					Edit: 'text',
					render: () => <AnnotationRender annotation={annotation} />,
				});
			}
		}

		if (footer) {
			syntheticFields.push({
				id: footerFieldId(slug),
				type: 'text',
				readOnly: true,
				Edit: 'text',
				render: () => <FooterRender footer={footer} />,
			});
		}

		return [
			...syntheticFields,
			...fields.map((field) => toDataFormField(field, settings)),
		];
	}, [badge, fields, footer, intro, settings, slug]);

	const formFieldChildren = useMemo(() => {
		const children: FormFieldChild[] = [];

		if (intro) {
			children.push(hiddenLayoutChild(introFieldId(slug)));
		}

		for (const field of fields) {
			children.push(field.id);

			if (field.annotation) {
				children.push(hiddenLayoutChild(annotationFieldId(field.id)));
			}
		}

		if (footer) {
			children.push(hiddenLayoutChild(footerFieldId(slug)));
		}

		return children;
	}, [fields, footer, intro, slug]);

	const cardGroup = useMemo(
		() => ({
			id: slug,
			label: title,
			description,
			layout: {
				type: 'card' as const,
				withHeader: true,
				isCollapsible: true,
				isOpened: defaultOpen,
				...(badge
					? {
							summary: [
								{
									id: badgeFieldId(slug),
									visibility: 'always' as const,
								},
							],
						}
					: {}),
			},
			children: formFieldChildren,
		}),
		[badge, defaultOpen, description, formFieldChildren, slug, title]
	);

	const handleChange = useCallback(
		(nextValues: Record<string, unknown>) => {
			const changedFieldId = findChangedFieldId(
				formDataRef.current,
				nextValues,
				fields.map((field) => field.id)
			);

			if (!changedFieldId || isSyntheticFieldId(changedFieldId)) {
				return;
			}

			const changedField = fields.find(
				(field) => field.id === changedFieldId
			);

			if (!changedField) {
				return;
			}

			const value = getValueByPath(nextValues, changedFieldId);

			if (isImmediateSaveField(changedField)) {
				void persistField(changedField, value);
				return;
			}

			scheduleDebouncedSave(changedField, value);
		},
		[fields, persistField, scheduleDebouncedSave]
	);

	return (
		<div className="prc-settings__fields-section">
			<DataForm
				data={formData}
				fields={dataFormFields}
				form={{
					layout: { type: 'card' },
					fields: [cardGroup],
				}}
				onChange={handleChange}
			/>
		</div>
	);
}
