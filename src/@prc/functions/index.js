import {
	getTerms,
	getTermsByLetter,
	getTermsAsOptions,
	getTermsAsTree,
	ifMatchSetAttribute,
	randomId,
	mailChimpInterests,
	arrayToCSV,
} from './functions';

function loadScript(slug, script) {
	if (!window.prcFunctions[slug]) {
		window.prcFunctions[slug] = script;
	}
}

window.prcFunctions = {};

loadScript('getTerms', getTerms);
loadScript('getTermsByLetter', getTermsByLetter);
loadScript('getTermsAsOptions', getTermsAsOptions);
loadScript('getTermsAsTree', getTermsAsTree);
loadScript('ifMatchSetAttribute', ifMatchSetAttribute);
loadScript('randomId', randomId);
loadScript('mailChimpInterests', mailChimpInterests);
loadScript('arrayToCSV', arrayToCSV);

console.log('Loading @prc/functions...', window.prcFunctions);
