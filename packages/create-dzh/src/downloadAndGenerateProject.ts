import * as path from 'path';
import * as ora from 'ora';
import * as fs from 'fs-extra';
import * as shell from 'shelljs';

const downloadGitRepo = require('download-git-repo');
const execSync = require('child_process').execSync;

export default function downloadAndGenerateProject(
  dirname: string,
  templateUrl: string
): Promise<void> {

  const spinner = ora('download git repo start').start();

  return new Promise((resolve) => {
    downloadGitRepo(templateUrl, path.join(process.cwd(), dirname), async (err) => {
      if (err) {
        spinner.fail('download git repo failed.');
        console.error(err);
        process.exit(1);
      }
      spinner.succeed('download git repo successfully.');
      await onDownloadSuccess(dirname);
      resolve();
    });
  });
}

function onDownloadSuccess(dirname: string) {
  // 进入生成的项目目录
  shell.cd(dirname);
  // 修改 package.json 的 name 字段
  modifyPackageJson(dirname);

  // Initialize git repo
  let initializedGit = false;
  if (tryGitInit()) {
    initializedGit = true;
    console.log();
    console.log('Initialized a git repository.');
  }

  // Create git commit if git repo was initialized
  if (initializedGit && tryGitCommit()) {
    console.log();
    console.log('Created git commit.');
  }

}

function modifyPackageJson(dirname: string) {
  let packageObj;

  try {
    packageObj = fs.readJsonSync('package.json');
    packageObj.name = dirname;
  } catch (err) {
    console.error(err);
  }

  try {
    fs.writeJsonSync('package.json', packageObj, {
      spaces: 2,
    });
  } catch (err) {
    console.error(err);
  }
}

function tryGitInit() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    if (isInGitRepository()) {
      return false;
    }

    execSync('git init', { stdio: 'ignore' });
    return true;
  } catch (e) {
    console.warn('Git repo not initialized', e);
    return false;
  }
}

function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function tryGitCommit() {
  try {
    execSync('git add -A', { stdio: 'ignore' });
    execSync('git commit -m "Initialize project using create-dzh"', {
      stdio: 'ignore',
    });
    return true;
  } catch (e) {
    // We couldn't commit in already initialized git repo,
    // maybe the commit author config is not set.
    // In the future, we might supply our own committer
    // like Ember CLI does, but for now, let's just
    // remove the Git files to avoid a half-done state.
    console.warn('Git commit not created', e);
    console.warn('Removing .git directory...');
    try {
      // unlinkSync() doesn't work on directories.
      fs.removeSync('.git');
    } catch (removeErr) {
      // Ignore.
    }
    return false;
  }
}
