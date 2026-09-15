/**
 * Curated living-picker index: PRC fill names + approved brands.
 */

export interface CuratedPickerIndex {
	prc: string[];
	brands: string[];
}

export const PRC_PICKER_LIBRARY = 'prc';
export const BRANDS_PICKER_LIBRARY = 'brands';
export const CUSTOM_SPRITE_NAMES = ['compare', 'presentation-screen'];
export const ICON_NAME_ALIASES: Record<string, string> = {
	'column-chart': 'chart-column',
	pdf: 'file-pdf',
};

export function resolvePrcIconName(name: string): string {
	return ICON_NAME_ALIASES[name] ?? name;
}

export function spriteLibraryForPrcName(): string {
	return PRC_PICKER_LIBRARY;
}

export function buildCuratedIconIndex(
	index: CuratedPickerIndex,
	brandCatalog: string[]
): Record<string, string[]> {
	return {
		[PRC_PICKER_LIBRARY]: [...index.prc],
		[BRANDS_PICKER_LIBRARY]: index.brands.filter((icon) =>
			brandCatalog.includes(icon)
		),
	};
}

export function normalizePickerLibrary(
	library: string,
	icon: string | undefined,
	curated: Record<string, string[]>
): string {
	if (library in curated) {
		return library;
	}
	const resolved = icon ? resolvePrcIconName(icon) : icon;
	if (resolved && (curated[PRC_PICKER_LIBRARY] || []).includes(resolved)) {
		return PRC_PICKER_LIBRARY;
	}
	if (resolved && (curated[BRANDS_PICKER_LIBRARY] || []).includes(resolved)) {
		return BRANDS_PICKER_LIBRARY;
	}
	return PRC_PICKER_LIBRARY;
}

export function isIconInCuratedIndex(
	icon: string | undefined,
	curated: Record<string, string[]>
): boolean {
	if (!icon) {
		return true;
	}
	const resolved = resolvePrcIconName(icon);
	return Object.values(curated).some(
		(icons) => icons.includes(icon) || icons.includes(resolved)
	);
}

export function libraryForCommit(
	browseLibrary: string,
	iconName: string
): string {
	if (browseLibrary === BRANDS_PICKER_LIBRARY) {
		return BRANDS_PICKER_LIBRARY;
	}
	void iconName;
	return spriteLibraryForPrcName();
}
