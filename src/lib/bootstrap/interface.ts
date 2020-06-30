// packages
import { PromptObject } from 'prompts';
import { Platform } from '@remax/types';

export interface BoostrapCommandState {
  initial: string;
  persistance: string[];
}

// @types/prompts 类型声明遗漏
export interface PromptObjectFix extends PromptObject {
  instructions?: boolean;
  optionsPerPage?: number;
}

export interface BootstrapCommandArgs {
  // 平行移植 remax build
  target: Platform;
  notify: boolean;
  analyze: boolean;
  // 新增，配置文件模板地址
  templateFile: string;
}

// app.json
export interface Manifest {
  pages: string[];
}
