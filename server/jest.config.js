module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 50,
      functions: 100,
      lines: 80,
    },
  },
};
