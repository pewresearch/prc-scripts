import HCaptcha from '@hcaptcha/react-hcaptcha';

function loadScript(slug, script) {
	if (!window[slug]) {
		window[slug] = script;
	}
}

loadScript('hcaptcha', HCaptcha);
