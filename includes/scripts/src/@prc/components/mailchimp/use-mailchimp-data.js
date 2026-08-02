/**
 * Shared Mailchimp audience / saved-segment data hooks.
 *
 * Hits the same REST endpoints as prc-email-builder
 * (`useAudiences` / `useSegments` in the email-builder sidebar).
 */

/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Resolve the email-builder REST namespace.
 *
 * @return {string} REST namespace without leading/trailing slashes.
 */
export function getMailchimpRestNamespace() {
	const ns = window?.prcEmailBuilderConfig?.restNamespace;
	if (typeof ns === 'string' && ns.length > 0) {
		return ns.replace(/^\/+|\/+$/g, '');
	}
	return 'prc-email-builder/v1';
}

/**
 * Fetch Mailchimp audiences (lists).
 *
 * @return {{ audiences: Array<{id: string, name: string}>, loading: boolean, error: string|null }} Audience list state.
 */
export function useMailchimpAudiences() {
	const [audiences, setAudiences] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let cancelled = false;
		const namespace = getMailchimpRestNamespace();

		apiFetch({
			path: `/${namespace}/audiences`,
		})
			.then((data) => {
				if (!cancelled) {
					setAudiences(Array.isArray(data) ? data : []);
					setLoading(false);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setError(
						err?.message ??
							__('Could not load audiences.', 'prc-scripts')
					);
					setLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return { audiences, loading, error };
}

/**
 * Fetch saved segments for a Mailchimp audience.
 *
 * @param {string} audienceId Mailchimp list (audience) ID.
 * @return {{ segments: Array<{id: number, name: string, type: string, member_count: number}>, loading: boolean, error: string|null }} Segment list state.
 */
export function useMailchimpSegments(audienceId) {
	const [segments, setSegments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!audienceId) {
			setSegments([]);
			setError(null);
			setLoading(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		const namespace = getMailchimpRestNamespace();

		apiFetch({
			path: `/${namespace}/audiences/${encodeURIComponent(audienceId)}/segments`,
		})
			.then((data) => {
				if (!cancelled) {
					setSegments(Array.isArray(data) ? data : []);
					setLoading(false);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setError(
						err?.message ??
							__('Could not load segments.', 'prc-scripts')
					);
					setLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [audienceId]);

	return { segments, loading, error };
}
