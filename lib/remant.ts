#!/usr/bin/env node

// packages
import { program } from 'commander';
// internal
import { create, CreateCommandOptions } from './create';

program.version('0.1.0');

program
  .command('create <component>')
  .option('-i, --ignore-page', 'create component without page')
  .option('-w, --without-default-props', 'skip default props padding')
  .description('setup package development grass')
  .action((component: string, option: CreateCommandOptions) => {
    create(component, option);
  });

program.parse(process.argv);
