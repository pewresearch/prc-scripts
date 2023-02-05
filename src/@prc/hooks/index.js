import useDebounce from './use-debounce';
import useFetch from './use-fetch';
import useKeyPress from './use-keypress';
import useHasSelectedInnerBlock from './use-has-innerblock-selected';
import useLocalStorage from './use-local-storage';
import useWindowSize from './use-window-size';

function loadScript(slug, script) {
	if (!window.prcHooks[slug]) {
		window.prcHooks[slug] = script;
	}
}

window.prcHooks = {};

loadScript('useDebounce', useDebounce);
loadScript('useFetch', useFetch);
loadScript('useKeyPress', useKeyPress);
loadScript('useLocalStorage', useLocalStorage);
loadScript('useWindowSize', useWindowSize);
loadScript('useHasSelectedInnerBlock', useHasSelectedInnerBlock);

console.log('Loading @prc/hooks...', window.prcHooks);
