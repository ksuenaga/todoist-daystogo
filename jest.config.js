module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Coverage configuration
    collectCoverageFrom: [
        'todoist-days-to-go.js',
        '!todoist-days-to-go.user.js', // Exclude userscript (it's the same logic wrapped)
        '!node_modules/**',
        '!coverage/**'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },

    // Coverage reporters
    coverageReporters: [
        'text',
        'text-summary',
        'html',
        'lcov'
    ],

    // Test match patterns
    testMatch: [
        '**/*.test.js'
    ],

    // Verbose output
    verbose: true,

    // Clear mocks between tests
    clearMocks: true,

    // Reset mocks between tests
    resetMocks: true,

    // Restore mocks between tests
    restoreMocks: true
};
