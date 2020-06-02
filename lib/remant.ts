#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import symbols from 'log-symbols';
import { pascalCase } from 'pascal-case';
import { program } from 'commander';

// render split
const renderIndex = (name: string) => `
  /**
   * @description - nothing but export component
   */
  export { default } from './${name}';
`;
const renderComponent = (name: string) => `
// packages
import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { View } from 'remax/wechat';
// internal
import './${name}.css';

// 默认值填充属性
interface Neutral${name}Props {}

interface Exogenous${name}Props {
  // 容器类名，用以覆盖内部
  className?: string;
}

type ${name}Props = Neutral${name}Props & Exogenous${name}Props;

const ${name}: FunctionComponent<${name}Props> = (props) => {
  const { className, children } = props;
  const classnames = {
    container: clsx(className),
  };

  return <View className={classnames.container}>{children}</View>;
};

export default ${name};
`;

const renderPage = (name: string) => `
// packages
import * as React from 'react';
import { View, Text } from 'remax/wechat';

// internal
import ${name} from '../../../packages/${name}';

export default () => {
  return (
    <View className="demo-block">
      <Text className="demo-block__title">基础用法</Text>
      <View className="demo-block__content">
      </View>
    </View>
  );
};
`;

const directory = process.cwd();

program
  .version('0.1.0')
  .command('create <component>')
  .option('-i, --ignore-page', 'create component without page')
  .description('setup package development grass')
  .action((component: string, option: { ignorePage: boolean }) => {
    const name = pascalCase(component);
    const files = [
      {
        filename: path.resolve(directory, `packages/${name}/index.ts`),
        content: renderIndex(name),
      },
      {
        filename: path.resolve(directory, `packages/${name}/${name}.tsx`),
        content: renderComponent(name),
      },
      {
        filename: path.resolve(directory, `packages/${name}/${name}.css`),
        content: '',
      },
    ];

    // several component without page preview
    if (!option.ignorePage) {
      files.push({
        filename: path.resolve(
          directory,
          `public/pages/${component}/index.tsx`
        ),
        content: renderPage(name),
      });
    }

    files.forEach((item) => {
      fs.ensureFile(item.filename).then(() => {
        console.log(
          ' ',
          symbols.success,
          chalk.cyan(path.relative(process.cwd(), item.filename))
        );

        fs.writeFileSync(item.filename, item.content);
      });
    });
  });

program.parse(process.argv);
