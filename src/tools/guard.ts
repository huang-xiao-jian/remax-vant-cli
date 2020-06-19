// packages
import chalk from 'chalk';
import { get } from 'node-emoji';

/**
 * @description - detect whether running within remax-vant project
 * @param {string} directory
 */
export function isRemaxVantDirectory(directory: string): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require, import/no-dynamic-require
    const meta = require(`${directory}/package.json`);

    return meta.name === 'remax-vant';
  } catch (err) {
    return false;
  }
}

export function guard(directory: string): void {
  if (!isRemaxVantDirectory(directory)) {
    // eslint-disable-next-line no-console
    console.log(
      chalk.red('Exception:'),
      get('ghost'),
      chalk.yellow('remant <command> should execute within remax-vant'),
      get('beer')
    );

    process.exit(1);
  }
}
