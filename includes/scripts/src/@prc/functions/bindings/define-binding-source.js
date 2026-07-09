/**
 * Register a block binding source with panel field discovery (`getFieldsList`).
 */
import { registerBlockBindingsSource } from '@wordpress/blocks';

/**
 * @param {Object} config
 * @param {string} config.name Binding source name.
 * @param {string} config.label Source label in the Bindings panel.
 * @param {string[]} [config.usesContext] Block context keys required by the source.
 * @param {Array<{label: string, type: string, args: Object}>} [config.fields] Static panel fields.
 * @param {Function} [config.getFieldsList] Dynamic panel fields (`{ select, context }`).
 * @param {Function} [config.getValues] Editor value resolver.
 * @param {Function} [config.setValues] Editor value writer.
 * @param {Function} [config.canUserEditValue] Whether inline editing is allowed.
 */
export function defineBindingSource({
	name,
	label,
	usesContext,
	fields,
	getFieldsList,
	getValues,
	setValues,
	canUserEditValue,
}) {
	registerBlockBindingsSource({
		name,
		label,
		usesContext,
		getFieldsList: getFieldsList || (fields ? () => fields : undefined),
		getValues,
		setValues,
		canUserEditValue,
	});
}
