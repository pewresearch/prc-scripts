/**
 * Internal Dependencies
 */
import Icon from './icon';
import IconLibraryIndex from './icon-library-index.json';
import curatedPrcIcons from './curated-prc-icons.json';
import {
	getIconSpriteHref,
	getIconSpriteSheetUrl,
	resolveIconName,
	resolveIconSource,
} from './resolve-icon-source';
import './style.scss';

export {
	Icon,
	IconLibraryIndex,
	curatedPrcIcons,
	getIconSpriteHref,
	getIconSpriteSheetUrl,
	resolveIconName,
	resolveIconSource,
};

if (!window.prcIcons) {
	window.prcIcons = {
		Icon,
		IconLibraryIndex,
		curatedPrcIcons,
		getIconSpriteHref,
		getIconSpriteSheetUrl,
		resolveIconName,
		resolveIconSource,
	};
}
