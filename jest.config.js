/**
 * Jest configuration for prc-shared unit tests.
 * Unit tests live under monorepo root tests/prc-shared/unit/.
 */
const path = require('path');

const unitRoot = path.resolve(__dirname, '../../tests/prc-shared/unit');

module.exports = {
	...require('@wordpress/scripts/config/jest-unit.config'),
	rootDir: __dirname,
	roots: [unitRoot],
	testMatch: ['**/*.test.js', '**/*.test.ts', '**/*.test.tsx'],
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$':
			require.resolve('@wordpress/scripts/config/babel-transform'),
	},
	// Transform ESM d3 / @visx packages pulled in via @prc/charting-utilities.
	transformIgnorePatterns: [
		'/node_modules/(?!((@visx|internmap|delaunator|robust-predicates)/|d3-))',
	],
};
