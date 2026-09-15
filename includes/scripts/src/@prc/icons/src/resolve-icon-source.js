/**
 * Shared resolver for @prc/icons: curated names use the PRC fill sprite.
 * Approved brands use the brands fill sprite (`build/icons/brands.svg`).
 * Missing names return kind `missing` — no Font Awesome Pro sprites.
 */

export const PRC_LIBRARY = 'prc';
export const BRANDS_LIBRARY = 'brands';

export const AVAILABLE_LIBRARIES = [PRC_LIBRARY, BRANDS_LIBRARY];

export const ICON_NAME_ALIASES = {
	'column-chart': 'chart-column',
	pdf: 'file-pdf',
	x: 'xmark',
	home: 'house',
	'globe-pointer': 'earth-americas',
	'chart-bar': 'chart-column',
	'building-magnifying-glass': 'magnifying-glass',
	'face-viewfinder': 'users-viewfinder',
	'filter-list': 'filter',
	filters: 'filter',
	'lock-hashtag': 'lock',
	'pen-field': 'pen-to-square',
	'table-pivot': 'table',
	'rectangle-history-circle-plus': 'circle-plus',
	'square-dashed-circle-plus': 'circle-plus',
	'arrow-down-small-big': 'arrow-down-short-wide',
	'arrow-up-small-big': 'arrow-up-short-wide',
	'cards-blank': 'clone',
	'chess-clock': 'stopwatch',
	'clock-two': 'clock',
	'credit-card-front': 'credit-card',
	donut: 'chart-pie',
	'input-text': 'i-cursor',
	'list-radio': 'circle-dot',
	'message-smile': 'comment',
	'rectangle-history': 'clone',
	'rectangle-vertical-history': 'bars-staggered',
	'shield-exclamation': 'shield-halved',
	slider: 'sliders',
	'chart-bullet': 'chart-simple',
	'hexagon-image': 'image',
	'pen-circle': 'pen',
	'card-spade': 'card',
	'family-dress': 'people-group',
	undo: 'arrow-rotate-left',
	'arrow-left-rotate': 'arrow-rotate-left',
	'arrow-rotate-back': 'arrow-rotate-left',
	'arrow-rotate-backward': 'arrow-rotate-left',
	redo: 'arrow-rotate-right',
	'arrow-right-rotate': 'arrow-rotate-right',
	'arrow-rotate-forward': 'arrow-rotate-right',
	history: 'clock-rotate-left',
	'chevron-circle-up': 'circle-chevron-up',
	'chevron-circle-down': 'circle-chevron-down',
	'chevron-circle-left': 'circle-chevron-left',
	'chevron-circle-right': 'circle-chevron-right',
};

/**
 * Map a historical icon name onto the curated fill name.
 *
 * @param {string} icon Icon name.
 * @return {string} Resolved kebab-case name.
 */
export function resolveIconName(icon) {
	if (typeof icon !== 'string' || icon === '') {
		return icon;
	}
	return ICON_NAME_ALIASES[icon] || icon;
}

/**
 * Empty source when the name is not a curated PRC fill or approved brand.
 *
 * @param {string} icon Resolved kebab-case name.
 * @return {{ kind: 'missing', spriteLibrary: string, icon: string }} Missing icon source.
 */
function missingSource(icon) {
	return {
		kind: 'missing',
		spriteLibrary: PRC_LIBRARY,
		icon,
	};
}

/**
 * Fill-sprite fragment URL for a library/name pair.
 *
 * Only `prc` and `brands` sheets exist. `kind: 'missing'` returns ''.
 *
 * @param {string} origin        Window origin.
 * @param {string} spriteLibrary Sprite slug (`prc` or `brands`).
 * @param {string} icon          Kebab-case icon name.
 * @param {string} [kind]        `resolveIconSource` kind (`prc`|`brands`|`missing`).
 * @return {string} Fragment URL, or empty string.
 */
export function getIconSpriteHref(origin, spriteLibrary, icon, kind) {
	if (kind === 'missing' || !icon) {
		return '';
	}
	const root = `${origin}/wp-content/plugins/prc-icon-library/build/icons`;
	if (spriteLibrary === BRANDS_LIBRARY || kind === BRANDS_LIBRARY) {
		return `${root}/brands.svg#${icon}`;
	}
	if (spriteLibrary === PRC_LIBRARY || kind === PRC_LIBRARY) {
		return `${root}/prc.svg#${icon}`;
	}
	return '';
}

/**
 * Fill-sprite sheet URL (no fragment) for fetch / CSS.
 *
 * @param {string} origin        Window origin.
 * @param {string} spriteLibrary Sprite slug (`prc` or `brands`).
 * @param {string} [kind]        `resolveIconSource` kind (`prc`|`brands`|`missing`).
 * @return {string} Sheet URL, or empty string.
 */
export function getIconSpriteSheetUrl(origin, spriteLibrary, kind) {
	const href = getIconSpriteHref(origin, spriteLibrary, '_', kind);
	if (!href) {
		return '';
	}
	const hash = href.lastIndexOf('#');
	return hash === -1 ? href : href.slice(0, hash);
}

/**
 * Resolve which fill sprite a JS `<Icon>` should load.
 *
 * Curated UI glyphs → `prc/{name}` even when the caller still passes a
 * historical FA weight (`solid`/`regular`/`light`). Approved brands →
 * `brands/{name}` on `build/icons/brands.svg`. Unapproved brands and
 * unregistered names return `kind: 'missing'` (no Pro sprite fallback).
 *
 * @param {Object}   options
 * @param {string}   [options.library]
 * @param {string}   options.icon
 * @param {string[]} [options.curatedNames]
 * @param {string[]} [options.approvedBrandNames]
 * @return {{ kind: 'prc'|'brands'|'missing', spriteLibrary: string, icon: string }} Sprite kind, library slug, and resolved name.
 */
export function resolveIconSource({
	library = PRC_LIBRARY,
	icon,
	curatedNames = [],
	approvedBrandNames = [],
}) {
	const resolvedIcon = resolveIconName(icon);
	const lib =
		typeof library === 'string' && library !== '' ? library : PRC_LIBRARY;

	if (lib === BRANDS_LIBRARY) {
		if (approvedBrandNames.includes(resolvedIcon)) {
			return {
				kind: 'brands',
				spriteLibrary: BRANDS_LIBRARY,
				icon: resolvedIcon,
			};
		}
		return missingSource(resolvedIcon);
	}

	if (curatedNames.includes(resolvedIcon)) {
		return {
			kind: 'prc',
			spriteLibrary: PRC_LIBRARY,
			icon: resolvedIcon,
		};
	}

	return missingSource(resolvedIcon);
}
