import {
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import type { DataFormControlProps } from '@wordpress/dataviews';

function isFieldDisabled<Item>(
	field: DataFormControlProps<Item>['field'],
	data: Item
): boolean {
	if (typeof field.isDisabled === 'function') {
		return field.isDisabled({ item: data, field });
	}

	return Boolean(field.isDisabled);
}

function numericConstraint(rule: unknown): number | undefined {
	if (typeof rule === 'number') {
		return rule;
	}

	if (
		rule &&
		typeof rule === 'object' &&
		'constraint' in rule &&
		typeof (rule as { constraint: unknown }).constraint === 'number'
	) {
		return (rule as { constraint: number }).constraint;
	}

	return undefined;
}

function helpText(description: unknown): string | undefined {
	return typeof description === 'string' ? description : undefined;
}

export function SettingsReadOnlyEdit<Item>({
	field,
	data,
}: DataFormControlProps<Item>) {
	const Render = field.render;

	if (!Render) {
		return null;
	}

	return <Render item={data} field={field} />;
}

export function SettingsBooleanEdit<Item>({
	data,
	field,
	onChange,
}: DataFormControlProps<Item>) {
	const { label, description, getValue, setValue } = field;

	return (
		<ToggleControl
			label={label}
			help={helpText(description)}
			checked={Boolean(getValue({ item: data }))}
			onChange={(checked) =>
				onChange(setValue({ item: data, value: checked }))
			}
			disabled={isFieldDisabled(field, data)}
			__nextHasNoMarginBottom
		/>
	);
}

export function SettingsSelectEdit<Item>({
	data,
	field,
	onChange,
	hideLabelFromVision,
}: DataFormControlProps<Item>) {
	const { label, description, getValue, setValue, elements = [] } = field;
	const value = getValue({ item: data });

	return (
		<SelectControl
			label={label}
			help={helpText(description)}
			value={value === undefined || value === null ? '' : String(value)}
			options={elements.map((element) => ({
				label: element.label,
				value: String(element.value),
			}))}
			onChange={(nextValue) => {
				const match = elements.find(
					(element) => String(element.value) === nextValue
				);
				onChange(
					setValue({
						item: data,
						value: match ? match.value : nextValue,
					})
				);
			}}
			disabled={isFieldDisabled(field, data)}
			hideLabelFromVision={hideLabelFromVision}
			__nextHasNoMarginBottom
			__next40pxDefaultSize
		/>
	);
}

interface SettingsTextareaEditProps<Item> extends DataFormControlProps<Item> {
	rows?: number;
}

export function SettingsTextareaEdit<Item>({
	data,
	field,
	onChange,
	hideLabelFromVision,
	config,
	rows,
}: SettingsTextareaEditProps<Item>) {
	const { label, description, placeholder, getValue, setValue } = field;
	const value = getValue({ item: data });

	return (
		<TextareaControl
			label={label}
			help={helpText(description)}
			placeholder={placeholder}
			value={value === undefined || value === null ? '' : String(value)}
			onChange={(nextValue) =>
				onChange(setValue({ item: data, value: nextValue }))
			}
			rows={rows ?? config?.rows ?? 4}
			disabled={isFieldDisabled(field, data)}
			hideLabelFromVision={hideLabelFromVision}
			__nextHasNoMarginBottom
		/>
	);
}

export function createSettingsTextareaEdit(rows: number) {
	return function SettingsTextareaFieldEdit<Item>(
		props: DataFormControlProps<Item>
	) {
		return <SettingsTextareaEdit {...props} rows={rows} />;
	};
}

interface SettingsTextEditProps<Item> extends DataFormControlProps<Item> {
	inputType?: 'text' | 'email' | 'password';
}

export function SettingsTextEdit<Item>({
	data,
	field,
	onChange,
	hideLabelFromVision,
	inputType = 'text',
}: SettingsTextEditProps<Item>) {
	const { label, description, placeholder, getValue, setValue } = field;
	const value = getValue({ item: data });

	return (
		<TextControl
			type={inputType}
			label={label}
			help={helpText(description)}
			placeholder={placeholder}
			value={value === undefined || value === null ? '' : String(value)}
			onChange={(nextValue) =>
				onChange(setValue({ item: data, value: nextValue }))
			}
			disabled={isFieldDisabled(field, data)}
			hideLabelFromVision={hideLabelFromVision}
			__nextHasNoMarginBottom
			__next40pxDefaultSize
		/>
	);
}

export function SettingsEmailEdit<Item>(props: DataFormControlProps<Item>) {
	return <SettingsTextEdit {...props} inputType="email" />;
}

export function SettingsPasswordEdit<Item>(props: DataFormControlProps<Item>) {
	return <SettingsTextEdit {...props} inputType="password" />;
}

export function SettingsNumberEdit<Item>({
	data,
	field,
	onChange,
	hideLabelFromVision,
}: DataFormControlProps<Item>) {
	const { label, description, getValue, setValue, isValid } = field;
	const value = getValue({ item: data });
	const step = field.type === 'integer' ? 1 : undefined;

	return (
		<NumberControl
			label={label}
			help={helpText(description)}
			value={value === undefined || value === null ? '' : value}
			onChange={(nextValue) =>
				onChange(
					setValue({
						item: data,
						value:
							nextValue === '' || nextValue === undefined
								? undefined
								: Number(nextValue),
					})
				)
			}
			min={numericConstraint(isValid?.min)}
			max={numericConstraint(isValid?.max)}
			step={step}
			disabled={isFieldDisabled(field, data)}
			hideLabelFromVision={hideLabelFromVision}
			__next40pxDefaultSize
		/>
	);
}
