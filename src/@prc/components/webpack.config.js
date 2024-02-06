const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

module.exports = {
	...defaultConfig,
	devtool: 'source-map',
	plugins: [
		...defaultConfig.plugins.filter(
			(plugin) =>
				'DependencyExtractionWebpackPlugin' !== plugin.constructor.name
		),
		new DependencyExtractionWebpackPlugin({
			injectPolyfill: true,
			// eslint-disable-next-line consistent-return
			requestToExternal(request) {
				/* My externals */
				if (request.includes('@prc/hooks')) {
					return 'prcHooks';
				}
				if (request.includes('@prc/functions')) {
					return 'prcFunctions';
				}
				if (request.includes('@prc/components')) {
					return 'prcComponents';
				}
				if (request.includes('@prc/controls')) {
					return 'prcControls';
				}
				if (request.includes('@prc/icons')) {
					return 'prcIcons';
				}
				if (request.includes('firebase/app')) {
					return 'firebase';
				}
				if (request.includes('firebase/auth')) {
					return 'firebaseAuth';
				}
				if (request.includes('firebase/database')) {
					return 'firebaseDatabase';
				}
			},
			// eslint-disable-next-line consistent-return
			requestToHandle(request) {
				if ('@prc/hooks' === request) {
					return 'prc-hooks';
				}
				if ('@prc/functions' === request) {
					return 'prc-functions';
				}
				if ('@prc/components' === request) {
					return 'prc-components';
				}
				if ('@prc/controls' === request) {
					return 'prc-controls';
				}
				if ('@prc/icons' === request) {
					return 'prc-icons';
				}
				if ('firebase/app' === request) {
					return 'firebase';
				}
				if ('firebase/auth' === request) {
					return 'firebase';
				}
				if ('firebase/database' === request) {
					return 'firebase';
				}
			},
		}),
	],
};
