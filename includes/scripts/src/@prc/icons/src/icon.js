/* eslint-disable import/no-extraneous-dependencies -- WordPress provides @wordpress/element at runtime. */
import { memo, useMemo } from '@wordpress/element';

import curatedPrcIcons from './curated-prc-icons.json';
import {
	PRC_LIBRARY,
	getIconSpriteHref,
	resolveIconSource,
} from './resolve-icon-source';

// Module-level cache for icon sources
const iconSourceCache = new Map();

const VALID_UNITS = [
	'px',
	'em',
	'rem',
	'%',
	'vw',
	'vh',
	'vmin',
	'vmax',
	'ex',
	'ch',
	'cm',
	'mm',
	'in',
	'pt',
	'pc',
];

function hasUnit(value) {
	return VALID_UNITS.some((unit) => value.endsWith(unit));
}

const Icon = memo(
	({
		library = PRC_LIBRARY,
		icon,
		size = 1,
		color = null,
		className = '',
	}) => {
		const source = resolveIconSource({
			library,
			icon,
			curatedNames: curatedPrcIcons.prc,
			approvedBrandNames: curatedPrcIcons.brands,
		});
		const { spriteLibrary, kind } = source;
		const resolvedIcon = source.icon;
		const isMissing = kind === 'missing';

		const xlinkHref = useMemo(() => {
			const cacheKey = `${kind}:${spriteLibrary}#${resolvedIcon}`;
			if (!iconSourceCache.has(cacheKey)) {
				const origin =
					typeof window !== 'undefined' && window.location
						? window.location.origin
						: '';
				iconSourceCache.set(
					cacheKey,
					getIconSpriteHref(origin, spriteLibrary, resolvedIcon, kind)
				);
			}
			return iconSourceCache.get(cacheKey);
		}, [kind, spriteLibrary, resolvedIcon]);

		const sizeUnit = useMemo(() => {
			if (typeof size === 'number') {
				return `${size}em`;
			}
			if (typeof size === 'string') {
				return hasUnit(size) ? size : `${size}em`;
			}
			return undefined;
		}, [size]);

		const colorStyle = useMemo(() => {
			if (color) {
				return { color: `${color} !important` };
			}
			return {};
		}, [color]);

		const style = useMemo(() => {
			return {
				width: sizeUnit,
				height: sizeUnit,
				...colorStyle,
			};
		}, [sizeUnit, colorStyle]);

		if (!icon || typeof icon !== 'string' || isMissing) {
			return null;
		}

		const rootClassName = ['icon', className].filter(Boolean).join(' ');

		return (
			<i className={rootClassName}>
				<svg style={style}>
					<use xlinkHref={xlinkHref}></use>
				</svg>
			</i>
		);
	}
);

Icon.displayName = 'Icon';

export default Icon;
