import { URLSearchField, URLSearchToolbar } from './url-search';
import HeadingLevelToolbar from './heading-level-toolbar';
import {
	registerListStore,
	ListStoreItem,
	actions,
	reducer,
} from './list-store';
import MediaDropZone from './media-dropzone';
import TaxonomySelect from './taxonomy-select';

function loadScript(slug, script) {
	if (!window.prcComponents[slug]) {
		window.prcComponents[slug] = script;
	}
}

window.prcComponents = {};

loadScript('URLSearchField', URLSearchField);
loadScript('URLSearchToolbar', URLSearchToolbar);
loadScript('HeadingLevelToolbar', HeadingLevelToolbar);
loadScript('registerListStore', registerListStore);
loadScript('ListStoreItem', ListStoreItem);
loadScript('listStoreActions', actions);
loadScript('listStoreReducer', reducer);
loadScript('MediaDropZone', MediaDropZone);
loadScript('TaxonomySelect', TaxonomySelect);

console.log('Loading @prc/components...', window.prcComponents);
