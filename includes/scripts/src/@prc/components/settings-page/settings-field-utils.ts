import type { Field } from '@wordpress/dataviews';

import {
	SettingsBooleanEdit,
	SettingsEmailEdit,
	SettingsNumberEdit,
	SettingsPasswordEdit,
	SettingsSelectEdit,
	SettingsTextEdit,
	createSettingsTextareaEdit,
} from './settings-dataform-edits';
import type { SettingsFieldConfig } from './types';

const SYNTHETIC_FIELD_PREFIX = '__';

export function badgeFieldId(slug: string): string {
	return `${SYNTHETIC_FIELD_PREFIX}${slug}_badge`;
}

export function introFieldId(slug: string): string {
	return `${SYNTHETIC_FIELD_PREFIX}${slug}_intro`;
}

export function annotationFieldId(fieldId: string): string {
	return `${SYNTHETIC_FIELD_PREFIX}${fieldId}_annotation`;
}

export function footerFieldId(slug: string): string {
	return `${SYNTHETIC_FIELD_PREFIX}${slug}_footer`;
}

export function contentFieldId(slug: string): string {
	return `${SYNTHETIC_FIELD_PREFIX}${slug}_content`;
}

export function isSyntheticFieldId(fieldId: string): boolean {
	return fieldId.startsWith(SYNTHETIC_FIELD_PREFIX);
}

export function getValueByPath(
	object: Record<string, unknown>,
	path: string
): unknown {
	return path.split('.').reduce<unknown>((current, key) => {
		if (current === null || current === undefined) {
			return undefined;
		}
		if (typeof current !== 'object') {
			return undefined;
		}
		return (current as Record<string, unknown>)[key];
	}, object);
}

/**
 * Whether `path` exists on `object` (even when the leaf value is undefined).
 * Used to ignore sparse DataForm patches that omit unchanged nested siblings.
 *
 * @param object
 * @param path
 */
export function hasPath(
	object: Record<string, unknown>,
	path: string
): boolean {
	const keys = path.split('.');
	let current: unknown = object;

	for (const key of keys) {
		if (
			current === null ||
			current === undefined ||
			typeof current !== 'object'
		) {
			return false;
		}

		if (!Object.prototype.hasOwnProperty.call(current, key)) {
			return false;
		}

		current = (current as Record<string, unknown>)[key];
	}

	return true;
}

export function setValueByPath<T extends Record<string, unknown>>(
	object: T,
	path: string,
	value: unknown
): T {
	const keys = path.split('.');
	if (keys.length === 1) {
		return {
			...object,
			[keys[0]]: value,
		};
	}

	const [head, ...rest] = keys;
	const current = object[head];
	const nextBranch =
		current && typeof current === 'object' && !Array.isArray(current)
			? (current as Record<string, unknown>)
			: {};

	return {
		...object,
		[head]: setValueByPath(nextBranch, rest.join('.'), value),
	};
}

export function applyFieldValuesToSettings<T extends Record<string, unknown>>(
	settings: T,
	fieldValues: Record<string, unknown>
): T {
	return Object.entries(fieldValues).reduce(
		(nextSettings, [fieldId, value]) =>
			setValueByPath(nextSettings, fieldId, value),
		settings
	);
}

export function buildFormDataFromFields(
	settings: Record<string, unknown>,
	fields: SettingsFieldConfig[]
): Record<string, unknown> {
	return fields.reduce<Record<string, unknown>>((formData, field) => {
		const rawValue = getValueByPath(settings, field.id);
		const value = field.format
			? field.format(rawValue, settings)
			: rawValue;

		return setValueByPath(formData, field.id, value);
	}, {});
}

export function parseFieldValuesFromForm(
	settings: Record<string, unknown>,
	fieldValues: Record<string, unknown>,
	fields: SettingsFieldConfig[]
): Record<string, unknown> {
	return fields.reduce<Record<string, unknown>>((parsed, field) => {
		const rawValue = getValueByPath(fieldValues, field.id);

		if (rawValue === undefined) {
			return parsed;
		}

		parsed[field.id] = field.parse
			? field.parse(rawValue, settings)
			: rawValue;
		return parsed;
	}, {});
}

function dataFormEditForField(field: SettingsFieldConfig) {
	switch (field.type) {
		case 'boolean':
			return SettingsBooleanEdit;
		case 'select':
			return SettingsSelectEdit;
		case 'textarea':
			return createSettingsTextareaEdit(field.rows ?? 4);
		case 'integer':
		case 'number':
			return SettingsNumberEdit;
		case 'email':
			return SettingsEmailEdit;
		case 'password':
			return SettingsPasswordEdit;
		case 'text':
			return SettingsTextEdit;
		default: {
			const exhaustive: never = field.type;
			return exhaustive;
		}
	}
}

export function toDataFormField(
	field: SettingsFieldConfig,
	settings: Record<string, unknown>
): Field<Record<string, unknown>> {
	const dataFormField: Field<Record<string, unknown>> = {
		id: field.id,
		label: field.label,
		description: field.description,
		type:
			field.type === 'select' || field.type === 'textarea'
				? 'text'
				: field.type,
		placeholder: field.placeholder,
	};

	if (field.type === 'select' && field.options) {
		dataFormField.elements = field.options;
	}

	if (field.edit) {
		dataFormField.Edit = field.edit;
	} else {
		dataFormField.Edit = dataFormEditForField(field);
	}

	if (field.min !== undefined || field.max !== undefined) {
		dataFormField.isValid = {
			...(field.min !== undefined ? { min: field.min } : {}),
			...(field.max !== undefined ? { max: field.max } : {}),
		};
	}

	if (field.isVisible) {
		dataFormField.isVisible = () => field.isVisible!(settings);
	}

	if (field.isDisabled) {
		dataFormField.isDisabled = () => field.isDisabled!(settings);
	}

	return dataFormField;
}

export function findChangedFieldId(
	previousValues: Record<string, unknown>,
	nextValues: Record<string, unknown>,
	fieldIds: string[]
): string | null {
	for (const fieldId of fieldIds) {
		// DataViews 17.2 setValue() returns only the changed field path.
		// Omitted nested siblings are unchanged.
		if (!hasPath(nextValues, fieldId)) {
			continue;
		}

		if (
			getValueByPath(previousValues, fieldId) !==
			getValueByPath(nextValues, fieldId)
		) {
			return fieldId;
		}
	}

	return null;
}

export function areFieldValuesDirty(
	storedValues: Record<string, unknown>,
	draftValues: Record<string, unknown>,
	fieldIds: string[]
): boolean {
	return fieldIds.some(
		(fieldId) => storedValues[fieldId] !== draftValues[fieldId]
	);
}

export function getFlatFieldValuesFromFormData(
	formData: Record<string, unknown>,
	fieldIds: string[]
): Record<string, unknown> {
	return fieldIds.reduce<Record<string, unknown>>((values, fieldId) => {
		values[fieldId] = getValueByPath(formData, fieldId);
		return values;
	}, {});
}

export function mergeDraftValuesIntoFormData(
	formData: Record<string, unknown>,
	draftValues: Record<string, unknown>
): Record<string, unknown> {
	return Object.entries(draftValues).reduce(
		(nextFormData, [fieldId, value]) =>
			setValueByPath(nextFormData, fieldId, value),
		formData
	);
}
