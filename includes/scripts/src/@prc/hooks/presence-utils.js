/**
 * Whether Presence API can be read and written on this site. Reads the flag
 * emitted by `Scripts::localize_platform_info()` in `prc-shared`, which in
 * turn reflects `wp_presence_is_available()` on the PHP side.
 *
 * Note: `wp_localize_script()` casts PHP booleans to strings ("1" for true,
 * "" for false), so we check for the string '1' rather than the boolean true.
 *
 * When false (production environments that don't ship the optional
 * presence-api plugin), consuming hooks short-circuit to fully inert: no
 * `apiFetch`, no `setInterval`, no state writes. Callers see an empty
 * `users` list and `isPresent: false` — the same shape they'd see in a
 * room with no occupants.
 *
 * **Temporary:** tied to `window.prcPlatform.presenceApiEnabled` until Presence
 * is integrated more deeply; then this gate (and the flag) should go away.
 *
 * @return {boolean} True when the Presence API REST endpoints are expected to exist.
 */
export function isPresenceApiEnabled() {
	return (
		typeof window !== 'undefined' &&
		window.prcPlatform?.presenceApiEnabled === '1'
	);
}
