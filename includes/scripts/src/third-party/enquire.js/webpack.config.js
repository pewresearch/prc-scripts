const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
	...defaultConfig,
	context: __dirname,
	entry: { index: './index.js' },
	output: {
		...defaultConfig.output,
		path: __dirname + '/../../../build/third-party/enquire.js',
		// Entry re-exports enquire.js default. Without `export: 'default'`,
		// webpack assigns `{ default: enquire }` to window.enquire and breaks
		// bare `enquire.register(...)` / `window.enquire.register(...)`.
		library: { name: 'enquire', type: 'window', export: 'default' },
	},
};
