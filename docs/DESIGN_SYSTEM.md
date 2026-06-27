# Tongue Web Design System

## Design read

面向重视效率、隐私与长期健康管理的职场用户。视觉语言参考瑞士疗愈空间：安静、克制、可信、精确，不使用营销页式的高饱和渐变和装饰性动效。

## Taste dials

- Design variance: 5/10
- Motion intensity: 3/10
- Visual density: 4/10

## Visual principles

1. 使用温暖矿物灰、低饱和鼠尾草绿和少量黄铜色。
2. 一个页面只保留一个主要强调色。
3. 图标统一使用 `lucide-vue-next`，线宽为 `1.7`。
4. 大容器圆角 22-30px，内部控件圆角 10-16px。
5. 阴影只表达层级，避免默认黑色重阴影。
6. 正文宽度控制在约 65-72 个字符，行高 1.7-1.9。
7. 动效以 220ms 的位移、透明度和背景变化为主。
8. 所有交互控件必须具备 hover、active 和 focus-visible 状态。

## Core tokens

核心变量位于 `packages/shared/src/styles/tokens.css`：

- `--th-bg`: 页面矿物灰背景
- `--th-surface`: 主表面
- `--th-primary`: 鼠尾草绿
- `--th-primary-dark`: 深森林绿
- `--th-primary-soft`: 浅绿色背景
- `--th-accent`: 黄铜色，仅用于编号和少量信息强调
- `--th-border`: 统一边框色
- `--th-shadow-sm`: 普通浮层
- `--th-shadow`: 重点浮层

## Layout

- 桌面端使用 232px 导航侧栏。
- 页面内容最大宽度为 1240px。
- 移动端侧栏转为抽屉，不压缩主内容。
- 主要页面水平留白使用 `clamp()`，避免固定像素造成不同屏幕拥挤。

## Component rules

- 健康建议优先使用结构化标题、摘要和要点，不使用单个超长段落。
- 报告列表使用响应式卡片，不使用移动端难以阅读的宽表格。
- 状态使用带圆点的克制徽标，不使用高饱和胶囊标签。
- 空状态必须包含图标、标题和下一步说明。
- 删除操作使用图标按钮并保留确认流程。

## Accessibility

- 保持可见的键盘焦点。
- 支持 `prefers-reduced-motion`。
- 图标按钮必须提供 `aria-label` 或 `title`。
- 正文和背景保持足够对比度。
