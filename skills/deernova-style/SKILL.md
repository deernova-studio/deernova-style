---
name: deernova-style
description: Deernova 的界面设计语言：只用黑白灰，纸面承载内容、玻璃承载操作，衬线说话、无衬线做事，Mac 紧凑、iOS 留足点击区域。在 Deernova 的 macOS、iOS 或 Web 应用里新建、修改或审查界面时使用，包括页面布局、颜色、字体、间距、按钮、列表、侧边栏、弹窗、空状态、AI 对话界面，以及对应的 SwiftUI 或 CSS 实现。
---

# Deernova 设计语言

这份 skill 说明 Deernova 的界面应该是什么样子、为什么这样，以及在 SwiftUI 和 Web 里怎么落地。它不是组件库：不需要安装任何包，用项目现有的技术栈和组件实现这些规则，缺的部分再按这里的规格补上。

一句话：只用黑、白、灰；内容放在不透明的纸面上，操作浮在玻璃上；标题和长文用衬线，界面文字用系统无衬线；整体紧凑、安静、克制，像一件趁手的工具。

## 先读什么

| 任务 | 读这里 |
| --- | --- |
| 任何界面工作 | 本文件的「核心规则」和「平台速查」 |
| 需要具体数值：颜色、字号、间距、圆角、尺寸 | [设计变量](references/tokens.md)；原始数据在 `assets/tokens.json`，CSS 版在 `assets/tokens.css` |
| 规则背后的细节：颜色层级、字体、线条、玻璃、动效、图标、文案、无障碍 | [基础](references/foundations.md) |
| 做某一类界面：页面骨架、按钮、输入、侧边栏、列表、卡片、弹窗、空状态、AI 对话 | [界面模式](references/patterns.md) |
| 用 SwiftUI 实现 macOS / iOS 界面 | [SwiftUI 落地](references/swiftui.md) |
| 用 HTML / CSS / 前端框架实现 | [Web 落地](references/web.md) |
| 审查已有界面是否符合 Deernova | [审查清单](references/review.md) |
| 想先看整体效果 | `assets/screens/` 里的截图：`mac-window-*.png`（Mac 窗口）、`iphone-screens-*.png`（iPhone 列表页和对话页）、`iphone-button-sizes-*.png`（iOS 按钮尺寸放在手机里的样子），各有浅色和深色 |

## 核心规则

1. **纸面与玻璃分层。** 文字、列表、卡片、代码、消息、输入框是内容，放在不透明的纸面上：`canvas` → `surface` → `surface-raised`，凹下去的区域用 `surface-sunken`。工具栏、标签栏、浮动按钮、弹出层是操作，浮在内容之上，用系统的 Liquid Glass。玻璃上不放段落，内容不做成玻璃，玻璃不叠玻璃。
2. **黑白灰，强调靠对比。** `accent` 就是墨色 `ink`：主按钮在浅色主题是黑底白字，在深色主题是白底黑字。主按钮上的文字用 `on-accent`，不要写死白色。界面里唯一的彩色是状态色 `success`、`warning`、`danger`、`info`，只用来表达状态，而且必须同时带图标或文字。开关打开时用 `success`。
3. **线条代替阴影。** 区块之间用 `line` 色的细线分隔（`stroke-hairline`，1 个物理像素）。卡片不加阴影；只有菜单、弹窗、浮动面板和 Composer 这类真正浮起来的东西才用 `shadow-float`。
4. **衬线说话，无衬线做事。** 标题、空状态、长文和 AI 的回答用衬线（New York）；按钮、标签、列表、表单用系统无衬线（SF Pro）；代码和需要对齐的数字用等宽（SF Mono）。中文统一落到苹方。
5. **紧凑，但给手指留位置。** Mac 正文 13pt、控件 24pt、列表行 26pt；iOS 正文 17pt，点击区域至少 44pt，按钮看起来是 36pt。间距走 4pt 网格，组与组之间的间距至少是组内的 2 倍，用细线和少量留白分组，不靠大块空白和外框。
6. **原生优先。** 系统已有的控件（Toggle、Picker、Menu、Form、Sheet、Alert、NavigationSplitView、TabView）直接用，只通过 `tint` 和字体让它们融入。只为系统没有的东西写自定义视图，比如 Composer、AI 消息、执行步骤。

## 平台速查

| | macOS | iOS |
| --- | --- | --- |
| 正文 | 13pt / 行高 18（`mac-body`） | 17pt / 行高 23，用 `.body` 等文本样式，支持动态字体 |
| 长文、AI 回答 | 衬线 14pt / 行高 22（`mac-prose`） | 衬线 17pt / 行高 26（`ios-prose`） |
| 默认按钮 | 24pt 高，圆角 6 | 看起来 36pt，点击区域补足到 44pt，胶囊形 |
| 小按钮 / 大按钮 | 20pt / 28pt | 30pt（列表行里的行内操作）/ 46pt 通栏（整页唯一的底部主操作） |
| 列表行 | 26pt | 至少 44pt |
| 卡片 | 圆角 8，内边距 12 | 圆角 12，内边距 14 × 16 |
| 页面边距 | 16 | 16 |
| 阅读栏宽 | 不超过 680 | 屏幕宽度减去边距 |

Web 应用在桌面上沿用 Mac 的密度，在触屏上沿用 iOS 的点击区域，细节见 [Web 落地](references/web.md)。

## 工作流程

1. **先看项目。** 确认平台、最低系统版本、现有组件，以及颜色和样式是怎么管理的（Asset Catalog、CSS 变量、Tailwind 主题等）。
2. **接入变量。** 把 Deernova 的 token 接进项目现有的体系，用语义名引用（`ink`、`surface`、`line`），不要在代码里散落十六进制颜色。
3. **按模式实现。** 在 [界面模式](references/patterns.md) 里找到对应的做法，用项目的组件实现，并补齐真正需要的状态：默认、悬停或按下、选中、禁用、加载、空、错误。
4. **检查。** 浅色和深色两套主题、键盘焦点、点击区域、长文本和最大字号、减弱动态效果和降低透明度。审查时按 [审查清单](references/review.md) 逐项看。
5. **汇报。** 说明做了什么、哪些没有验证。不要因为这份 skill 就提高项目的最低系统版本、引入新的 UI 库或改动无关的页面。

## 不要做

- 加品牌色、渐变、彩色图标，或用 emoji 当图标。
- 给卡片加阴影或玻璃效果；在玻璃上放正文或列表。
- 一屏出现两个主按钮；用「确定」「OK」当按钮文字。
- 在 iOS 上写死字号让动态字体失效，或把 Mac 的 24pt 控件直接搬到触屏上。
- 只靠颜色表达状态。

## 文案速记

用「你」称呼用户，语气平实，不用感叹号和 emoji。按钮以动词开头（「保存」「新建笔记」），完成后用完成态（「已保存」）。错误提示说清楚出了什么问题、怎么解决。中文与英文、中文与数字之间加一个半角空格（「同步到 iCloud」「剩余 12 次」）。完整规则见 [基础](references/foundations.md) 的「文案」一节。

## 版本与更新

通过 `npx @deernova/style` 安装时，同一目录下的 `manifest.json` 记录版本和内容哈希；更新运行 `npx @deernova/style@latest update`。不要直接修改安装后的文件，规范的源文件在 deernova-style 仓库的 `skills/deernova-style/`。
