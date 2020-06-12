/**
 * @description - remant create <package> --ignore-page
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

// packages
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import symbols from 'log-symbols';
import { format } from 'prettier';
import { pascalCase } from 'pascal-case';
import { compile } from 'handlebars';

export enum RenderType {
  INDEX = 'INDEX',
  PAGE = 'PAGE',
  COMPONENT = 'COMPONENT',
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
  const result = compile(template)(context);

  return format(result, {
    singleQuote: true,
    arrowParens: 'always',
    trailingComma: 'es5',
    parser: 'babel-ts',
  });
};

// eslint-disable-next-line import/prefer-default-export
export function create(component: string, options: CreateCommandOptions): void {
  const directory = process.cwd();

  const name = pascalCase(component);
  const files = [
    {
      filename: path.resolve(directory, `packages/${name}/index.ts`),
      content: render(RenderType.INDEX, name),
    },
    {
      filename: path.resolve(directory, `packages/${name}/${name}.tsx`),
      content: render(RenderType.COMPONENT, name),
    },
    {
      filename: path.resolve(directory, `packages/${name}/${name}.css`),
      content: '',
    },
  ];

  // several component without page preview
  if (!options.ignorePage) {
    files.push({
      filename: path.resolve(directory, `public/pages/${component}/index.tsx`),
      content: render(RenderType.PAGE, name, options),
    });
  }

  files.forEach((item) => {
    fs.ensureFile(item.filename).then(() => {
      // eslint-disable-next-line no-console
      console.log(
        ' ',
        symbols.success,
        chalk.cyan(path.relative(process.cwd(), item.filename))
      );

      fs.writeFileSync(item.filename, item.content);
    });
  });
}
