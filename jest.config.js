'use strict';

/**
 * Jest configuration for the lab suite.
 *
 * The `jest-junit` reporter is installed and ready to use but is not enabled by
 * default, because turning it on is part of the pipeline work. Activate it from
 * the command line when you need a machine-readable report:
 *
 *   JEST_JUNIT_OUTPUT_DIR=./reports \
 *     npm test -- --reporters=default --reporters=jest-junit
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  reporters: ['default'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage',
  testTimeout: 20000,
  verbose: false,
};
