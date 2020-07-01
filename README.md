# Remax Vant Cli

使用 Remax 移植 `vant-weapp` 组件库，辅助迁移工具。

## 创建组件

```bash
# 执行构建命令
Usage: remant create [options] <component>

setup package development grass

Options:
  -i, --ignore-page  create component without page
  -h, --help         display help for command
```

## 快速启动

仅预设开发模式，其他环境切勿使用。

```bash
Usage: remant bootstrap [options]

take care pages only concerned about

Options:
  -t, --target <platform>         目标平台，如 wechat，ali (default: "wechat")
  -n, --notify                    编译错误提醒 (default: false)
  -a, --analyze                   编译分析 (default: false)
  -f, --template-file <filepath>  配置文件模板
  -h, --help                      display help for command
```

运行效果：

[![asciicast](https://asciinema.org/a/344422.svg)](https://asciinema.org/a/344422)

## 流程说明

![remax-vant-cli](https://user-images.githubusercontent.com/4002210/86196437-df52a000-bb85-11ea-8e75-d674522c995a.jpg)

## Licence

MIT
