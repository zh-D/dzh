#!/usr/bin/env node
import { Command } from 'commander';
import start from './scripts/start';


module.exports = async (packageInfo) => {
    if (packageInfo.__ICEJS_INFO__) {
        console.log(
            `${packageInfo.name} ${packageInfo.version}`,
            `(${packageInfo.__ICEJS_INFO__.name} ${packageInfo.__ICEJS_INFO__.version})`
        );
    } else {
        console.log(packageInfo.name, packageInfo.version);
    }

    // checkNodeVersion(packageInfo.engines.node, packageInfo.name);

    const program = new Command();

    program
        .version(packageInfo.version)
        .usage('<command> [options]');

    program
        .command('start')
        .description('start server')
        .allowUnknownOption()
        .option('--config <config>', 'use custom config')
        .option('-h, --host <host>', 'dev server host', '0.0.0.0')
        .option('-p, --port <port>', 'dev server port')
        .action(async () => {
            await start();
        })

    program.parse(process.argv);

    const subCmd = program.args[0];

    if (!subCmd) {
        program.help();
    }

};