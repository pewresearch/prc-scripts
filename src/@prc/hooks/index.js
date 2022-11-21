import useDebounce from './use-debounce';
import useFetch from './use-fetch';
import useKeyPress from './use-keypress';
import useLocalStorage from './use-local-storage';
import useWindowSize from './use-window-size';

function loadScript(slug, script) {
	if (window.prcScripts) {
		if (window.prScripts.hooks) {
			window.prcScripts.hooks[slug] = script;
		} else {
			window.prcScripts.hooks = { [slug]: script };
		}
	} else {
		window.prcScripts = { hooks: { [slug]: script } };
	}
	console.log(`Loaded script: ${slug}`, window.prcScripts);
}

console.log('Loading @prc/hooks...');
loadScript('useDebounce', useDebounce);
loadScript('useFetch', useFetch);
loadScript('useKeyPress', useKeyPress);
loadScript('useLocalStorage', useLocalStorage);
loadScript('useWindowSize', useWindowSize);
