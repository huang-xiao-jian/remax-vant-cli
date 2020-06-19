// package
import path from 'path';
import chalk from 'chalk';
import { buildApp } from 'remax/build';
import { Platform } from '@remax/types';
import prompts, { PromptObject, Answers } from 'prompts';
import { readdirSync, readFileSync, readJSONSync, writeFileSync } from 'fs-extra';
import { get } from 'node-emoji';
import { EventEmitter } from 'events';
import { stdin } from 'process';
// internal
import { cleanup } from './worker';
import { Pages } from './constant';

interface PromptObjectFix extends PromptObject {
  instructions?: boolean;
  optionsPerPage?: number;
}

interface BoostrapCommandState {
  initial: string;
  persistance: string[];
}

export interface BootstrapCommandArgs {
  // 平行移植 remax build
  target: Platform;
  notify: boolean;
  analyze: boolean;
  // 新增，配置文件模板地址
  templateFile: string;
}

interface Manifest {
  pages: string[];
}

interface Asset {
  source: {
    existsAt: string;
  };
}

// scope
const project = process.cwd();

enum RocketAction {
  Pristine = 'Pristine', // 退出交互模式
  TakeOver = 'TakeOver', // 进入交互模式
  Watch = 'Watch', // 首次构建信号
  Render = 'Render', // 渲染配置文件
  Exit = 'Exit', // 退出程序
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, no-console */

// raw mode, 类似 keypress 监听模式
export class RemaxVantRocket {
  private options: BootstrapCommandArgs;

  private state: BoostrapCommandState;

  // 分发事件
  private eventEmitter: EventEmitter;

  static bootstrap(options: BootstrapCommandArgs): void {
    (Reflect.construct(RemaxVantRocket, [options]) as RemaxVantRocket).interact(
      Buffer.from('P')
    );
  }

  constructor(options: BootstrapCommandArgs) {
    this.options = options;
    this.state = {
      initial: '',
      persistance: [],
    };
    // 事件监听协调
    this.eventEmitter = new EventEmitter();

    // 激活构建
    this.eventEmitter.once(RocketAction.Watch, () => this.build());

    // 渲染配置文件
    this.eventEmitter.on(RocketAction.Render, () => this.render());

    // 进入交互模式
    this.eventEmitter.on(RocketAction.TakeOver, () => this.takeOver());

    // 退出交互模式
    this.eventEmitter.on(RocketAction.Pristine, () => {
      // clear shell log
      console.clear();
      // avoid redundant execution
      stdin.off('data', this.interact);
    });

    // 退出程序
    this.eventEmitter.on(RocketAction.Exit, () => {
      console.clear();
      console.log(` ${get('rocket')} Goodbye, expect to see you again, dear friend`);
      process.exit();
    });
  }

  handlePickActiveCommand() {
    // 触发事件
    this.eventEmitter.emit(RocketAction.Pristine);

    const question: PromptObjectFix = {
      type: 'multiselect',
      name: 'pages',
      message: 'Page Choices',
      hint: 'please select mini pages concerned about',
      instructions: false,
      optionsPerPage: 16,
      choices: readdirSync(path.resolve(project, './storyboard/pages')).map(
        (dirname) => ({
          title: dirname,
          value: dirname,
        })
      ),
    };

    prompts(question).then((answers: Answers<'pages'>) => {
      // preserve choices
      this.state.persistance = answers.pages as string[];
      this.eventEmitter.emit(RocketAction.Render);
    });
  }

  handlePickInitialCommand() {
    // 触发事件
    this.eventEmitter.emit(RocketAction.Pristine);

    const question: PromptObjectFix = {
      type: 'select',
      name: 'initial',
      message: 'Pick Initial',
      hint: 'please select mini pages as first screen',
      choices: this.state.persistance.map((page) => ({
        title: page,
        value: page,
      })),
    };

    prompts(question).then((answers: Answers<'initial'>) => {
      // preserve choices
      this.state.initial = answers.initial;
      this.eventEmitter.emit(RocketAction.Render);
    });
  }

  render() {
    const templateFile = path.resolve(project, this.options.templateFile);
    const template = readFileSync(templateFile, 'utf-8');
    const destiny = path.resolve(path.dirname(templateFile), './app.config.ts');
    const pages = this.state.persistance
      .sort((l, r) => {
        if (l === this.state.initial) {
          return -1;
        }
        if (r === this.state.initial) {
          return 1;
        }
        return Pages.indexOf(l) - Pages.indexOf(r);
      })
      .map((pagename) => `'pages/${pagename}/index'`);
    const configuration = template.replace('/* Remant Inject */', pages.join(', '));

    // 输出配置文件
    writeFileSync(destiny, configuration);

    // 构建前清理 log
    console.clear();
    // 多次触发，监听函数仅执行一次
    this.eventEmitter.emit(RocketAction.Watch);
  }

  takeOver() {
    const commands = [
      `\n${get('ghost')} ${chalk.cyan(' Remant Usage:')}\n`,
      `${get('zany_face')} Press ${chalk.magenta('P')} to list pages concerned`,
      `${get('heart_eyes')} Press ${chalk.magenta('F')} to mark initial page`,
      `${get('beer')} Press ${chalk.magenta('Q')} to quick focus board`,
    ];
    console.log(commands.join('\n'));

    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', (data: Buffer) => this.interact(data));
  }

  // 交互模式
  interact(data: Buffer) {
    const input = String(data);
    const key = input.toUpperCase();
    // detect SIGINT in raw mode https://github.com/vadimdemedes/ink/blob/master/src/hooks/use-input.ts
    if (input <= '\u001A' && input !== '\r') {
      this.eventEmitter.emit(RocketAction.Exit);
    }
    // broadcast user command
    switch (key) {
      case 'P':
        this.handlePickActiveCommand();
        break;
      case 'F':
        this.handlePickInitialCommand();
        break;
      case 'Q':
        this.eventEmitter.emit(RocketAction.Exit);
        break;
      default:
        break;
    }
  }

  build() {
    const { target, analyze, notify } = this.options;
    const compiler = buildApp({
      target,
      analyze,
      notify,
      watch: true,
    });

    compiler.hooks.afterEmit.tap('PruneHarmfulPages', (compilation) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const asset = compilation.getAsset('app.json') as Asset;
      const manifest = readJSONSync(asset.source.existsAt) as Manifest;
      const pages = manifest.pages.map((pagepath) => pagepath.split('/')[1]);
      // 输出 pages 目录
      const outputPath = compiler.options.output?.path as string;
      const directories = readdirSync(path.resolve(outputPath, './pages'));

      directories
        .filter((dirname) => !pages.includes(dirname))
        .forEach((dirname) => {
          cleanup(outputPath, dirname);
        });

      // 回传信号
      this.eventEmitter.emit(RocketAction.TakeOver);
    });
  }
}
