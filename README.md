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

## 快捷选择页面

仅预设开发模式，不应使用与标准构建模式。

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
