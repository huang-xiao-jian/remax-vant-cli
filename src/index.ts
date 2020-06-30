// packages
import { program } from 'commander';
// internal
import { create, CreateCommandOptions } from './create';
import { RemaxVantRocket } from './bootstrap';
import { BootstrapCommandArgs } from './bootstrap/interface';

program
  .command('create <component>')
  .option('-i, --ignore-page', 'create component without page')
  .option('-w, --without-default-props', 'skip default props padding')
  .description('setup package development grass')
  .action((component: string, option: CreateCommandOptions) => {
    create(component, option);
  });

// focus 模式仅关注 webpack watch compilation
program
  .command('bootstrap')
  .option(
    '-t, --target <platform>',
    '目标平台，如 wechat，ali',
    /^(wechat|ali|toutiao)$/,
    'wechat'
  )
  .option('-n, --notify', '编译错误提醒', false)
  .option('-a, --analyze', '编译分析', false)
  .requiredOption('-f, --template-file <filepath>', '配置文件模板')
  .description('take care pages only concerned about')
  .action((argv: BootstrapCommandArgs) => {
    RemaxVantRocket.bootstrap(argv);
  });

export default program;
