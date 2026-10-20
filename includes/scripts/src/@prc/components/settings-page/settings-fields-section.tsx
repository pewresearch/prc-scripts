/* eslint-disable @wordpress/i18n-text-domain -- textDomain is supplied by consumer plugins */
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import type { MutableRefObject, ReactNode } from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { DataForm } from '@wordpress/dataviews';
import type { Field } from '@wordpress/dataviews';
import { store as noticesStore } from '@wordpress/notices';

import { useSettingsPageContext } from './settings-page-context';
import { SettingsReadOnlyEdit } from './settings-dataform-edits';
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

const sectionFlushers = new Set<() => Promise<void>>();

/**
 * Save every debounced field draft now and wait for all field saves in flight.
 *
 * Call before an action that reads the saved settings on the server.
 */
export async function flushSettingsSaves(): Promise<void> {
	await Promise.all(Array.from(sectionFlushers, (flush) => flush()));
}

function fieldSavedMessage(
	field: SettingsFieldConfig,
	value: unknown,
	textDomain: string
): string {
	if (field.type !== 'boolean') {
		/* translators: %s: field label */
		return sprintf(__('%s updated.', textDomain), field.label);
	}
	return value
		? /* translators: %s: field label */
			sprintf(__('%s enabled.', textDomain), field.label)
		: /* translators: %s: field label */
			sprintf(__('%s disabled.', textDomain), field.label);
}

function trackSave(inFlight: Set<Promise<void>>, save: Promise<void>) {
	inFlight.add(save);
	void save.finally(() => {
		inFlight.delete(save);
	});
	return save;
}

function useRegisterFlusher(
	debounceTimersRef: MutableRefObject<
		Record<string, ReturnType<typeof setTimeout>>
	>,
	debouncedSavesRef: MutableRefObject<Record<string, () => Promise<void>>>,
	inFlightSavesRef: MutableRefObject<Set<Promise<void>>>
) {
	useEffect(() => {
		const flush = async () => {
			for (const [fieldId, timer] of Object.entries(
				debounceTimersRef.current
			)) {
				clearTimeout(timer);
				void debouncedSavesRef.current[fieldId]?.();
			}
			await Promise.all(inFlightSavesRef.current);
		};
		sectionFlushers.add(flush);
		return () => {
			sectionFlushers.delete(flush);
		};
	}, [debounceTimersRef, debouncedSavesRef, inFlightSavesRef]);
}

function isImmediateSaveField(field: SettingsFieldConfig): boolean {
	return (
		field.type === 'boolean' ||
		field.type === 'select' ||
		field.autoSave === true
	);
}

function reconcilePendingValues(
	currentPending: Record<string, unknown>,
	debouncedFieldIds: string[],
	storedFormData: Record<string, unknown>,
	prevStoredFormData: Record<string, unknown>,
	debounceTimers: Record<string, ReturnType<typeof setTimeout>>
): Record<string, unknown> {
	const nextPending = { ...currentPending };
	let changed = false;

	for (const fieldId of debouncedFieldIds) {
		if (nextPending[fieldId] === undefined) {
			continue;
		}

		const storedValue = getValueByPath(storedFormData, fieldId);

		if (storedValue === nextPending[fieldId]) {
			delete nextPending[fieldId];
			changed = true;
			continue;
		}

		// Store changed underneath a local draft (e.g. Generate key).
		// Cancel the pending debounce so it cannot overwrite the newer value.
		const prevStoredValue = getValueByPath(prevStoredFormData, fieldId);
		if (storedValue !== prevStoredValue) {
			if (debounceTimers[fieldId]) {
				clearTimeout(debounceTimers[fieldId]);
				delete debounceTimers[fieldId];
			}
			delete nextPending[fieldId];
			changed = true;
		}
	}

	return changed ? nextPending : currentPending;
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
	const debouncedSavesRef = useRef<Record<string, () => Promise<void>>>({});
	const inFlightSavesRef = useRef(new Set<Promise<void>>());
	const formDataRef = useRef(storedFormData);

	const formData = useMemo(
		() => mergeDraftValuesIntoFormData(storedFormData, pendingValues),
		[storedFormData, pendingValues]
	);
	formDataRef.current = formData;
	const prevStoredFormDataRef = useRef(storedFormData);

	useEffect(() => {
		const prevStoredFormData = prevStoredFormDataRef.current;
		prevStoredFormDataRef.current = storedFormData;

		setPendingValues((currentPending) =>
			reconcilePendingValues(
				currentPending,
				debouncedFieldIds,
				storedFormData,
				prevStoredFormData,
				debounceTimersRef.current
			)
		);
	}, [debouncedFieldIds, storedFormData]);

	const persistField = useCallback(
		async (field: SettingsFieldConfig, value: unknown) => {
			const parsedValues = parseFieldValuesFromForm(
				settings,
				setValueByPath({}, field.id, value),
				[field]
			);

			applyPatch(parsedValues);

			const successMessage = fieldSavedMessage(field, value, textDomain);

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

	const trackedPersistField = useCallback(
		(field: SettingsFieldConfig, value: unknown) =>
			trackSave(inFlightSavesRef.current, persistField(field, value)),
		[persistField]
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

			const save = () => {
				delete debounceTimersRef.current[field.id];
				delete debouncedSavesRef.current[field.id];
				return trackedPersistField(field, value);
			};
			debouncedSavesRef.current[field.id] = save;
			debounceTimersRef.current[field.id] = setTimeout(() => {
				void save();
			}, DEBOUNCE_MS);
		},
		[trackedPersistField]
	);

	useRegisterFlusher(debounceTimersRef, debouncedSavesRef, inFlightSavesRef);

	const dataFormFields = useMemo(() => {
		const syntheticFields: Field<Record<string, unknown>>[] = [];

		if (badge) {
			syntheticFields.push({
				id: badgeFieldId(slug),
				type: 'text',
				readOnly: true,
				Edit: SettingsReadOnlyEdit,
				render: () => <BadgeRender badge={badge} />,
			});
		}

		if (intro) {
			syntheticFields.push({
				id: introFieldId(slug),
				type: 'text',
				readOnly: true,
				Edit: SettingsReadOnlyEdit,
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
					Edit: SettingsReadOnlyEdit,
					render: () => <AnnotationRender annotation={annotation} />,
				});
			}
		}

		if (footer) {
			syntheticFields.push({
				id: footerFieldId(slug),
				type: 'text',
				readOnly: true,
				Edit: SettingsReadOnlyEdit,
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
				withHeader: true as const,
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
				void trackedPersistField(changedField, value);
				return;
			}

			scheduleDebouncedSave(changedField, value);
		},
		[fields, trackedPersistField, scheduleDebouncedSave]
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
