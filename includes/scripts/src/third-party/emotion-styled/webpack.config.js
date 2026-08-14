const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

const basePluginsWithoutDep = (defaultConfig.plugins || []).filter(
	(plugin) => !(plugin instanceof DependencyExtractionWebpackPlugin)
);

module.exports = {
	...defaultConfig,
	context: __dirname,
	entry: { index: './index.js' },
	output: {
		...defaultConfig.output,
		path: __dirname + '/../../../build/third-party/emotion-styled',
		// Export the default styled() function onto the global. Without
		// `export: 'default'`, webpack assigns `{ default: styled }` and ESM
		// consumers (e.g. MUI in the Publishing Calendar) call the object as a
		// function → "X is not a function" at shouldForwardProp.
		library: { name: 'emotionStyled', type: 'window', export: 'default' },
	},
	plugins: [
		...basePluginsWithoutDep,
		new DependencyExtractionWebpackPlugin({
			requestToExternal(request) {
				if (request === 'react') {
					return 'React';
				}
				if (request === 'react-dom' || request === 'react-dom/client') {
					return 'ReactDOM';
				}
			},
			requestToHandle(request) {
				if (request === 'react') {
					return 'react';
				}
				if (request === 'react-dom' || request === 'react-dom/client') {
					return 'react-dom';
				}
			},
		}),
	],
};
