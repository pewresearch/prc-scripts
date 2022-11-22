/**
 * External Dependencies
 */
import { Splide } from '@splidejs/splide';
import { Intersection } from '@splidejs/splide-extension-intersection';

function loadScript(slug, script) {
	if (!window[slug]) {
		window[slug] = script;
	}
}

loadScript('splide', Splide);
loadScript('splideIntersection', Intersection);
