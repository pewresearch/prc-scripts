/**
 * Shared D3 global (`window.d3`) for webpack externals.
 *
 * Webpack aliases `d3` to the UMD `d3/dist/d3.js` build so we do not traverse
 * `d3/src` (npm workspaces may omit transitive `d3-*` packages). That UMD
 * attaches the full API to `globalThis.d3`. A bare `export * from 'd3'` against
 * the UMD module yields an empty library object, so the prior build finished with
 * `window.d3 = {}` and wiped the populated UMD export.
 *
 * Re-export the populated UMD global as the library default instead.
 */
import 'd3';

const root =
	typeof globalThis !== 'undefined'
		? globalThis
		: typeof window !== 'undefined'
			? window
			: {};

const d3 = root.d3;

export default d3;
