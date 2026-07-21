import { useEffect, useRef, useState } from '@wordpress/element';

/**
 * Structural equality for settings draft values (primitives, arrays, plain objects).
 *
 * Used so store rehydration that only replaces references does not wipe drafts.
 *
 * @param a First value.
 * @param b Second value.
 */
function isStructurallyEqual(a: unknown, b: unknown): boolean {
	if (Object.is(a, b)) {
		return true;
	}

	if (
		a === null ||
		b === null ||
		typeof a !== 'object' ||
		typeof b !== 'object'
	) {
		return false;
	}

	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
			return false;
		}

		return a.every((item, index) => isStructurallyEqual(item, b[index]));
	}

	const aObj = a as Record<string, unknown>;
	const bObj = b as Record<string, unknown>;
	const aKeys = Object.keys(aObj);
	const bKeys = Object.keys(bObj);

	if (aKeys.length !== bKeys.length) {
		return false;
	}

	return aKeys.every(
		(key) =>
			Object.prototype.hasOwnProperty.call(bObj, key) &&
			isStructurallyEqual(aObj[key], bObj[key])
	);
}

/**
 * Keeps local draft state in sync with a store-backed value.
 *
 * Rehydrates only when the store value's contents change. Unrelated settings
 * saves that replace object/array references (e.g. full-settings POST
 * responses) must not clear in-progress section drafts.
 *
 * @param storeValue Current value from the settings store.
 */
export function useSettingsDraft<T>(storeValue: T): [T, (value: T) => void] {
	const [draft, setDraft] = useState<T>(storeValue);
	const previousStoreValueRef = useRef(storeValue);

	useEffect(() => {
		if (!isStructurallyEqual(storeValue, previousStoreValueRef.current)) {
			setDraft(storeValue);
		}
		previousStoreValueRef.current = storeValue;
	}, [storeValue]);

	return [draft, setDraft];
}
