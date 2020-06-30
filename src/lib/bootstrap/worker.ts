// packages
import path from 'path';
import { removeSync } from 'fs-extra';
import { get } from 'node-emoji';
import chalk from 'chalk';

/**
 * @description - 删除不关注页面，避免报错导致应用无法预览
 *
 * @param {string} basedir - output directory
 * @param {string} pageName - page name
 */
export function cleanup(basedir: string, pageName: string): void {
  const directory = path.resolve(basedir, `./pages/${pageName}`);
  /* eslint-disable no-console */
  try {
    removeSync(directory);

    console.log(get('nerd_face'), chalk.green(`clean unnecessary page -> ${pageName}`));
  } catch (err) {
    console.log(get('zany_face'), chalk.red(`please drop ${pageName} manually`));
  }
}
