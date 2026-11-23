import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		environment: 'jsdom',

		reporters: [ 'verbose' ],

		globals: true,

		clearMocks: true,

		coverage: {
			// Use Istanbul for equal output coverage instrumentation.
			provider: 'istanbul',
			reportsDirectory: 'coverage',

			reporter: [ 'clover', 'json', 'lcov', 'text' ],

			include: [ 'build-src' ],

			exclude: [
				'node_modules/**'
			],

			thresholds: {
				statements: 50,
				branches: 44,
				functions: 30,
				lines: 50
			}
		}
	}
} );
