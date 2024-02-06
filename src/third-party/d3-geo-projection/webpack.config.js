/**
 * Drop this webpack.config.js file into your projects package.json directory when using @wordpress/scripts to handle dependency extraction.
 */
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

module.exports = {
	...defaultConfig,
	devtool: 'source-map',
	plugins: [
		...defaultConfig.plugins.filter(
			(plugin) =>
				'DependencyExtractionWebpackPlugin' !== plugin.constructor.name,
		),
		new DependencyExtractionWebpackPlugin({
			injectPolyfill: true,
			// eslint-disable-next-line consistent-return
			requestToExternal(request) {
				if (request.includes('@prc/hooks')) {
					return 'prcHooks';
				}
				if (request.includes('@prc/functions')) {
					return 'prcFunctions';
				}
				if (request.includes('@prc/components')) {
					return 'prcComponents';
				}
				if (request.includes('enquire.js')) {
					return 'enquire';
				}
				if (request.includes('classnames')) {
					return 'classnames';
				}
				if (request.includes('classNames')) {
					return 'classnames';
				}
				if (request.includes('jabber')) {
					return 'jabber';
				}
				if (request.includes('d3') && !request.includes('d3-geo-projection')) {
					return 'd3';
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
				if ('enquire.js' === request) {
					return 'enquire.js';
				}
				if ('classnames' === request) {
					return 'classnames';
				}
				if ('jabber' === request) {
					return 'jabber';
				}
				if ('d3' === request) {
					return 'd3';
				}
			},
		}),
	],
};
