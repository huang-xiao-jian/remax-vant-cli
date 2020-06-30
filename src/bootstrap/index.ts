// package
import path from 'path';
import chalk from 'chalk';
import { buildApp } from 'remax/build';
import prompts, { Answers } from 'prompts';
import { readdirSync, readFileSync, readJSONSync, writeFileSync } from 'fs-extra';
import { get } from 'node-emoji';
import { EventEmitter } from 'events';
import Table from 'cli-table3';
import { stdin } from 'process';
import * as cursor from 'cli-cursor';
// internal
import { guard } from '../tools/guard';
import { cleanup } from './worker';
import { Pages } from './constant';
import {
  BoostrapCommandState,
  Manifest,
  BootstrapCommandArgs,
  PromptObjectFix,
} from './interface';

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

export class RemaxVantRocket {
  // cli 传递参数
  private options: BootstrapCommandArgs;

  // 内部管理状态
  private state: BoostrapCommandState;

  // 分发事件
  private eventEmitter: EventEmitter;

  static bootstrap(options: BootstrapCommandArgs): void {
    // 保证 remant 仅在 remax-vant 目录内执行
    guard(process.cwd());

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
    this.eventEmitter.once(RocketAction.Watch, this.build);

    // 渲染配置文件
    this.eventEmitter.on(RocketAction.Render, this.render);

    // 退出交互模式
    this.eventEmitter.on(RocketAction.Pristine, () => {
      // clear shell log
      console.clear();
      // 隐藏光标
      cursor.hide();

      // avoid redundant execution
      stdin.off('data', this.interact);
    });

    // raw mode, 类似 keypress 监听模式
    // 进入交互模式，
    this.eventEmitter.on(RocketAction.TakeOver, () => {
      // 隐藏光标
      cursor.hide();

      // output avaiable command
      const table = new Table({
        head: ['Letter', 'Description'],
      });

      table.push(
        [chalk.magenta('P'), 'select pages concerned from storyboard'],
        [chalk.magenta('F'), 'select initial page from concerned pages'],
        [chalk.magenta('C'), 'create new remax vant package'],
        [chalk.magenta('Q'), 'quit bootstrap dashboard just now']
      );

      console.log();
      console.log(`${get('ghost')} ${chalk.cyan(' Remant Usage:')}`);
      console.log();
      console.log(table.toString());

      // 恢复交互模式
      stdin.setRawMode(true);
      stdin.resume();
      stdin.on('data', this.interact);
    });
  }

  handlePickActiveCommand() {
    // 退出交互模式
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
      //  SIGINT pages 空数组
      if (Array.isArray(answers.pages)) {
        // 持久化结果
        this.state.persistance = answers.pages;
        // 修改 app.config.ts
        this.eventEmitter.emit(RocketAction.Render);
      }
    });
  }

  handlePickInitialCommand() {
    // 退出交互模式
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
      const initial = answers.initial as string;

      // 持久化结果
      this.state.initial = initial;
      // 修改 app.config.ts
      this.eventEmitter.emit(RocketAction.Render);
    });
  }

  handleCreateCommand() {
    // 退出交互模式
    this.eventEmitter.emit(RocketAction.Pristine);
  }

  // disable rule, keep command handler consistance
  // eslint-disable-next-line class-methods-use-this
  handleExitCommand() {
    console.clear();
    console.log(` ${get('rocket')} Goodbye, expect to see you again, dear friend`);
    process.exit();
  }

  render = () => {
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
    // 多次触发，监听函数仅执行一次，app.config.ts 改动后，自动进入
    this.eventEmitter.emit(RocketAction.Watch);
  };

  // 交互模式
  interact = (data: Buffer) => {
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
      case 'C':
        this.handleCreateCommand();
        break;
      case 'Q':
        this.handleExitCommand();
        break;
      default:
        break;
    }
  };

  build = () => {
    const { target, analyze, notify } = this.options;
    const compiler = buildApp({
      target,
      analyze,
      notify,
      watch: true,
    });

    // watch compile 时退出交互模式
    compiler.hooks.watchRun.tap('RemaxVantInteract', () => {
      this.eventEmitter.emit(RocketAction.Pristine);
    });

    // pages 列表变化，前次构建页面导致应用奔溃，原因不明，暂且删除处理
    compiler.hooks.done.tap('RemaxVantPruneHarmful', () => {
      // compilation may not include app.json, weired, read from output directory
      const outputPath = compiler.options.output?.path as string;
      const asset = path.resolve(outputPath, 'app.json');
      const manifest = readJSONSync(asset) as Manifest;
      const pages = manifest.pages.map((pagepath) => pagepath.split('/')[1]);
      // 输出 pages 目录
      const directories = readdirSync(path.resolve(outputPath, './pages'));

      directories
        .filter((dirname) => !pages.includes(dirname))
        .forEach((dirname) => {
          cleanup(outputPath, dirname);
        });

      // watch compile done 进入交互模式
      this.eventEmitter.emit(RocketAction.TakeOver);
    });
  };
}
