const defaultConfig = require('../../../../../../../packages');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');
const {
	requestToExternal,
	requestToHandle,
} = require('../../../../../../../dependency-extraction');

/** Bundle Emotion in @prc/components so StyledComponentContext and styled previews share one runtime. */
const BUNDLED_EMOTION = new Set([
	'@emotion/styled',
	'@emotion/react',
	'@emotion/cache',
]);

const basePluginsWithoutDep = (defaultConfig.plugins || []).filter(
	(plugin) => !(plugin instanceof DependencyExtractionWebpackPlugin)
);

module.exports = {
	...defaultConfig,
	context: __dirname,
	entry: { index: './exports.ts' },
	output: {
		...defaultConfig.output,
		path: __dirname + '/../../../build/@prc/components',
		library: { name: 'prcComponents', type: 'window' },
	},
	plugins: [
		...basePluginsWithoutDep,
		new DependencyExtractionWebpackPlugin({
			requestToExternal(request) {
				if (BUNDLED_EMOTION.has(request)) {
					return false;
				}
				return requestToExternal(request);
			},
			requestToHandle(request) {
				if (BUNDLED_EMOTION.has(request)) {
					return undefined;
				}
				return requestToHandle(request);
			},
		}),
	],
};
