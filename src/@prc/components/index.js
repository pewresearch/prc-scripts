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
import TermSelect from './term-select';
import Dropdown from './dropdown';

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
loadScript('TermSelect', TermSelect);
loadScript('Dropdown', Dropdown);

console.log('Loading @prc/components...', window.prcComponents);
