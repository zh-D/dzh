#!/usr/bin/env node
const createCli = require('../lib/create-cli');
const packageInfo = require('../package.json');

(async () => {
  console.log(createCli);
  await createCli(packageInfo);
})();
