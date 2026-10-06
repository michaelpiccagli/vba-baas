import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',

  moduleFileExtensions: ['js', 'json', 'ts'],

  testRegex: '.*\\.spec\\.ts$',

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.spec.json',
      },
    ],
  },

  extensionsToTreatAsEsm: ['.ts'],

  testEnvironment: 'node',

  collectCoverageFrom: ['src/**/*.(t|j)s'],

  coverageDirectory: './coverage',
};

export default config;