// 基础组件
const basic = ['button', 'cell', 'icon', 'image', 'layout', 'popup', 'transition'];
// 表单组件
const form = [
  'calendar',
  'checkbox',
  'datetime-picker',
  'field',
  'picker',
  'radio',
  'rate',
  'search',
  'slider',
  'stepper',
  'switch',
  'uploader',
];
// 反馈组件
const feedback = [
  'action-sheet',
  'dialog',
  'dropdown-menu',
  'loading',
  'notify',
  'overlay',
  'swipe-cell',
  'toast',
];
// 展示组件
const presentation = [
  'circle',
  'collapse',
  'count-down',
  'divider',
  'notice-bar',
  'panel',
  'progress',
  'skeleton',
  'steps',
  'sticky',
  'tag',
  'tree-select',
];
// 导航组件
const navigation = ['grid', 'index-bar', 'sidebar', 'nav-bar', 'tab', 'tabbar'];
// 业务组件
const business = ['area', 'card', 'submit-bar', 'goods-action'];

// 文档顺序
export const Pages = [
  ...basic,
  ...form,
  ...feedback,
  ...presentation,
  ...navigation,
  ...business,
];
