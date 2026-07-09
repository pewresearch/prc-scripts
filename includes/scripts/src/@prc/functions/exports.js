/**
 * Public API for @prc/functions.
 * Re-exports all functions from their modules for a single entry point.
 */

export { ifMatchSetAttribute } from './attributes';
export { randomId } from './id';
export {
	getTerms,
	getTermsByLetter,
	getTermsAsOptions,
	getTermsAsTree,
	wpRestApiTermsToTree,
} from './terms';
export { tableToArray, arrayToCSV } from './table-csv';
export { getPostByUrl } from './post';
export { hexToRgb, getContrastingColorFromHex } from './color';
export { default as writeInterstitialMessage } from './interstitialMessageGenerator';
export { getBlockGapSupportValue, findBlock } from './block-utils';
export { defineBindingSource } from './bindings/define-binding-source';
export {
	EDIT_CONTEXT_QUERY,
	POLL_INTERVAL_MS,
	entityRecordArgs,
	presenceRoom,
	formatPresenceNoticeMessage,
} from './synced-entity';
