/**
 * @description - remant create <package> --ignore-page
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

// packages
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { get } from 'node-emoji';
import { pascalCase } from 'pascal-case';
import { compile } from 'handlebars';

export enum RenderType {
  INDEX = 'index',
  PAGE = 'page',
  COMPONENT = 'component',
}

export interface CreateCommandOptions {
  ignorePage?: boolean;
  withoutDefaultProps?: boolean;
}

type RenderAbstract = (
  type: RenderType,
  name: string,
  options?: CreateCommandOptions
) => string;

export const render: RenderAbstract = (type, name, options) => {
  const location = path.resolve(__dirname, `./template/${type}.hbs`);
  const template = fs.readFileSync(location, 'utf-8');
  const context = options ? { ...options, name } : { name };

  return compile(template)(context);
};

// eslint-disable-next-line import/prefer-default-export
export function create(component: string, options: CreateCommandOptions): void {
  const project = process.cwd();

  const name = pascalCase(component);
  const files = [
    {
      filename: path.resolve(project, `packages/${name}/index.ts`),
      content: render(RenderType.INDEX, name),
    },
    {
      filename: path.resolve(project, `packages/${name}/${name}.tsx`),
      content: render(RenderType.COMPONENT, name),
    },
    {
      filename: path.resolve(project, `packages/${name}/${name}.css`),
      content: '',
    },
  ];

  // several component without page preview
  if (!options.ignorePage) {
    files.push({
      filename: path.resolve(project, `storyboard/pages/${component}/index.tsx`),
      content: render(RenderType.PAGE, name, options),
    });
  }

  files.forEach((item) => {
    fs.ensureFileSync(item.filename);

    // eslint-disable-next-line no-console
    console.log(' ', get('tada'), chalk.cyan(path.relative(project, item.filename)));

    fs.writeFileSync(item.filename, item.content);
  });
}
