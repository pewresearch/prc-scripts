const fs = require('fs');
const path = require('path');

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
		{
			apply(compiler) {
				compiler.hooks.afterEmit.tap('CopySettingsBootRoutes', () => {
					const dest = path.resolve(
						__dirname,
						'../../../build/@prc/components/boot'
					);
					fs.mkdirSync(dest, { recursive: true });
					fs.copyFileSync(
						path.resolve(__dirname, 'settings-page/boot/loader.js'),
						path.join(dest, 'loader.js')
					);
					fs.copyFileSync(
						path.resolve(
							__dirname,
							'settings-page/boot/content.js'
						),
						path.join(dest, 'content.js')
					);
				});
			},
		},
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
