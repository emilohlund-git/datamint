const { runCLI } = require('jest');
require('ts-node/register');

const config = require('./jest.config.ts');

const options = {
  config,
  runInBand: true,
  silent: false,
};

runCLI(options, [process.cwd()])
  .then(({ results }) => {
    if (results.numFailedTests || results.numFailedTestSuites) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });