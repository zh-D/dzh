const createCli = require('./create-cli');

export default (frameworkName, { packageInfo }) => {
    // eslint-disable-next-line global-require
    const pkg = require('../package.json');
    process.env.__FRAMEWORK_NAME__ = frameworkName;
    packageInfo.__ICEJS_INFO__ = { name: pkg.name, version: pkg.version };
    createCli(packageInfo);
};
