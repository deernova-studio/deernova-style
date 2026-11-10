---
name: deernova-style
description: Deernova 的界面设计语言：只用黑白灰，内容放在不透明纸面上，原生端的操作层用系统 Liquid Glass，Web 应用用不透明平面加 1px 线；界面和 AI 回答用无衬线，衬线只给大标题和长文；按场景（Web 应用、macOS、iOS、iPadOS、官网与文档）切换密度。在 Deernova 的应用或网站里新建、修改或审查界面时使用，包括颜色、字体、间距、圆角、线条、阴影、按钮、输入框、复选框单选滑块、表单、表格、菜单与下拉选择、命令面板、侧边栏、顶栏、列表、卡片、弹窗、tooltip、加载与骨架、空状态与错误页、横幅与轻提示（撤销、报错）、通知（角标、通知中心、系统通知）、AI 对话、AI 输入框（附件、@ 提及、/ 命令、模型、发送）、思考与工具调用、权限确认与变更审批、AI 向用户提问（选项卡片）、建议提示、产物预览和任务清单，以及对应的 CSS、Tailwind 或 SwiftUI 实现。
---

# Deernova 设计语言

只用黑、白、灰；内容放在不透明的纸面上，原生端的操作层交给系统玻璃；界面文字用系统无衬线，衬线只用来点题；整体安静、克制、层次清楚，像一件趁手的工具。

Web 应用和 macOS 内容区（桌面档）的骨架和密度参照 Claude 桌面端（Code）：288 宽的侧边栏、44 高的顶栏、居中的对话栏、底部的输入区、可以并排打开的侧面板，正文 15/24。颜色、玻璃和衬线是 Deernova 自己的。

这份 skill 是规范和数据，不是组件库：不需要安装任何包。用项目现有的技术栈和组件实现这些规则，缺的部分按这里的规格和参考写法补上。

## 第一步：确定场景

所有尺寸都按场景取值。先看你在做哪一种界面，再去读对应的场景说明。

<!-- tokens:scenes -->
| 场景 | 密度 | 输入 | 怎么启用 | 读这里 |
| --- | --- | --- | --- | --- |
| Web 应用 | 桌面（`desktop`） | 指针 | tokens.css 的默认值 | [scenes/web.md](references/scenes/web.md) |
| Web 触屏 | 触控（`touch`） | 触摸 | `@media (pointer: coarse)` 自动切换 | [scenes/web.md](references/scenes/web.md) |
| macOS | 桌面（`desktop`） | 指针 | 系统控件用系统尺寸；内容区用 `DeernovaTokens.swift` 的 `#if os(macOS)` | [scenes/macos.md](references/scenes/macos.md) |
| iOS | 触控（`touch`） | 触摸 | `DeernovaTokens.swift` 的 `#else` | [scenes/ios.md](references/scenes/ios.md) |
| iPadOS | 触控（`touch`） | 触摸和指针 | 同 iOS；分栏布局另见场景说明 | [scenes/ipados.md](references/scenes/ipados.md) |
| 官网与文档 | 舒展（`comfortable`） | 指针 | 根元素加 `data-density="comfortable"` | [scenes/web-marketing.md](references/scenes/web-marketing.md) |
<!-- /tokens -->

后台、工具、编辑器、AI 对话这类应用界面，不论是不是网页，都不要用官网的尺寸。

## 场景速查

<!-- tokens:summary -->
| | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 |
| --- | --- | --- | --- |
| 正文 | 15 / 24 | 17 / 23 | 15 / 24 |
| 长文、AI 回答（衬线） | 16 / 26 | 17 / 26 | 17 / 28 |
| 默认按钮（可见高度） | 28，圆角 6 | 36，胶囊 | 36，胶囊 |
| 小 / 大按钮 | 24 / 32 | 30 / 46 | 32 / 44 |
| 最小点击区域 | 24 | 44 | 24 |
| 输入框 | 28 | 44 | 40 |
| 列表行 | 32 | 44 | 40 |
| 卡片：圆角 / 内边距 | 12 / 12 × 16 | 12 / 14 × 16 | 12 / 24 × 24 |
| 页面边距 | 32 | 16 | 32 |
| 侧边栏宽度 | 288 | 320 | 260 |
<!-- /tokens -->

所有数值都来自 `assets/tokens.json`，按密度生成在 `assets/tokens.css` 里。写代码时引用变量名（`var(--button-height-md)`、`Deernova.buttonHeightMd`），不要抄数字。

## 核心规则

1. **纸面承载内容，玻璃交给系统。** 文字、列表、卡片、代码、消息、输入区是内容，放在不透明的纸面上：`canvas` → `surface` → `surface-raised`，代码块和展开的详情用 `surface-sunken`。操作层按平台处理：**SwiftUI 端**（macOS、iOS、iPadOS）的侧边栏、工具栏、标签栏、浮动按钮直接用系统 Liquid Glass，这是原生端的优势，不要盖掉；**Web 应用**不模拟玻璃，操作层是不透明平面加 1px 分隔线；只有官网与文档的页眉可以用轻玻璃。玻璃上不放段落，内容不做成玻璃，玻璃不叠玻璃。
2. **黑白灰，强调靠对比。** `accent` 就是墨色 `ink`：主按钮在浅色主题是黑底白字，在深色主题是白底黑字，文字用 `on-accent`，不要写死白色。唯一的彩色是状态色 `success`、`warning`、`danger`、`info`，只用来表达状态，而且必须同时带图标或文字。
3. **细线分区，阴影表达层级。** 区块之间用 `line` 色的 1px 线分隔（`stroke-line`），卡片不加阴影。菜单、弹窗、浮动面板和 Composer 用 `shadow-float`。激活和聚焦不加阴影，唯一的例外是输入框聚焦时的 `shadow-control`（见第 5 条）。
4. **无衬线做界面，衬线点题。** 界面文字、AI 回答、用户消息、标题栏都用系统无衬线（SF Pro）；代码和需要对齐的数字用等宽（SF Mono）。衬线（New York）只用在页面大标题和空状态标题（`display`、`title`）、官网与文档，以及文章类的长文阅读（`prose`）。中文统一落到苹方。
5. **激活不加装饰，键盘焦点要看得见。** 悬停 `fill-hover`，按下和选中 `fill-selected`，选中项悬停不再加深。输入框和下拉框是浅灰底加一条 1px `line` 浅线，聚焦时换成白底并加一层柔和的控件阴影。其他控件用键盘聚焦（`:focus-visible`）时画一圈 2px 的 `focus-ring` 焦点环，鼠标点击时不出现；聚焦不改底色，免得和按下、选中分不清。悬停不位移，只写在 `@media (hover: hover)` 里，见 [交互状态](references/foundations/states.md)。
6. **层次靠字号和灰度，少用粗体。** 600 只给真正的标题（`display`、`title`、`headline`）。分组标题、会话名、说明、时间戳用常规字重，靠 `ink-secondary`、`ink-tertiary` 和小一号的字区分层级。
7. **控件高度由 token 决定，点击区域单独补。** 按钮、输入框、列表行的可见高度直接用 `button-height-*`、`field-height`、`row-height`，上下内边距为 0，不让页面行高把它撑高。可见尺寸小于 `hit-min` 时，用透明的命中区补足，不加大可见的控件。
8. **间距成组。** 间距走 4pt 网格。组内用 `gap-stack`，组与组之间用 `gap-group`（至少 2 倍）；内容区里段落、工具调用、卡片之间 `space-4`。用细线和少量留白分组，不靠大块空白和外框。
9. **原生端用系统控件，Web 端用同一套自绘组件。** SwiftUI 端的导航结构、侧边栏、工具栏、菜单、表单、弹窗直接用系统控件和系统尺寸，只通过颜色和字体让它们融入；自己画的内容区（对话、卡片、输入区、任务清单）用 token。Web 应用没有系统控件可借，按组件说明里的规格画，骨架见 [Web 应用](references/scenes/web.md)。
10. **对齐按内容选。** 单行的控件和行在固定高度里垂直居中；图标和文字按中线，不同字号的文字按基线；三行以上的内容，图标和头像对齐第一行；空状态放在略高于正中的位置。不用内边距或 `top` 微调去凑居中。内容栏限宽并在主内容区里居中，见 [布局与对齐](references/foundations/layout.md)。

## 读什么

| 你在做 | 先读 |
| --- | --- |
| 任何界面 | 上面的核心规则，加上对应的场景说明 `references/scenes/` |
| 提示、报错、撤销、通知 | [反馈与通知](references/foundations/feedback.md)：先用里面的表选对方式，再读对应的组件 |
| AI 功能：对话、输入框、工具调用、确认、提问 | [AI 交互](references/foundations/ai.md)：一轮回答的顺序、状态和原则，再读里面列出的组件 |
| 某个组件 | [组件](#组件)里对应的文件：用途、尺寸表、状态、Web 和 SwiftUI 写法 |
| 需要具体数值 | [设计变量](references/tokens.md)；数据在 `assets/tokens.json` |
| 接入变量 | CSS：`assets/tokens.css`；Tailwind v4：`assets/tailwind.css`；SwiftUI：`assets/DeernovaTokens.swift` |
| 某条规则为什么这样 | [基础](#基础)里对应的主题 |
| 审查已有界面 | [审查清单](references/review.md) |
| 先看原生端的玻璃效果 | `assets/screens/` 里的截图，各有浅色和深色 |

### 基础

[颜色](references/foundations/color.md) · [交互状态](references/foundations/states.md) · [字体](references/foundations/typography.md) · [间距](references/foundations/spacing.md) · [布局与对齐](references/foundations/layout.md) · [圆角](references/foundations/radius.md) · [线条](references/foundations/stroke.md) · [层级与阴影](references/foundations/elevation.md) · [玻璃](references/foundations/glass.md) · [动效](references/foundations/motion.md) · [反馈与通知](references/foundations/feedback.md) · [AI 交互](references/foundations/ai.md) · [图标](references/foundations/iconography.md) · [文案](references/foundations/writing.md) · [无障碍](references/foundations/accessibility.md)

### 组件

按它在页面里扮演的角色分成五组。

- **页面结构**：[顶栏与侧面板](references/components/toolbar.md) · [侧边栏](references/components/sidebar.md) · [玻璃操作层](references/components/glass-controls.md)
- **基础控件**：[按钮](references/components/button.md) · [文本框](references/components/text-field.md) · [选择控件](references/components/choice.md) · [分段控件](references/components/segmented.md) · [菜单与下拉](references/components/menu.md) · [表单](references/components/form.md)
- **内容展示**：[卡片](references/components/card.md) · [分组列表](references/components/list.md) · [表格](references/components/table.md) · [标签](references/components/tag.md) · [代码块](references/components/code-block.md) · [空状态与错误页](references/components/empty-state.md)
- **浮层与反馈**：[弹窗、抽屉与 popover](references/components/sheet.md) · [命令面板](references/components/command.md) · [Tooltip 与悬停浮层](references/components/tooltip.md) · [横幅与轻提示](references/components/banner.md) · [通知](references/components/notification.md) · [加载状态](references/components/skeleton.md)
- **AI 组合**：[建议与新对话](references/components/suggestion.md) · [Composer（AI 输入框）](references/components/composer.md) · [提及与命令](references/components/mention.md) · [消息](references/components/message.md) · [思考、工具调用与执行步骤](references/components/step-row.md) · [确认与审批](references/components/approval.md) · [AI 提问](references/components/question.md) · [任务清单](references/components/task-list.md) · [产物与预览](references/components/artifact.md)（先读总纲 [AI 交互](references/foundations/ai.md)）

### 场景

[Web 应用](references/scenes/web.md) · [官网与文档](references/scenes/web-marketing.md) · [macOS](references/scenes/macos.md) · [iOS](references/scenes/ios.md) · [iPadOS](references/scenes/ipados.md) · [SwiftUI 共用](references/scenes/swiftui.md)

## 工作流程

1. **先看项目。** 确认场景（上面的表）、最低系统版本、现有组件，以及颜色和样式怎么管理（CSS 变量、Tailwind 主题、Asset Catalog）。
2. **接入变量。** 把对应的生成文件接进项目现有的体系，用语义名引用（`ink`、`surface`、`button-height-md`），不要在代码里散落十六进制颜色和尺寸数字。
3. **按组件实现。** 找到对应的组件说明，用项目的组件实现，并补齐需要的状态：默认、悬停或按下、选中、禁用、加载、空、错误。
4. **检查。** 浅色和深色两套主题；量一下默认按钮的实际高度是否等于 `button-height-md`；键盘焦点、点击区域、长文本和最大字号、减弱动态效果和降低透明度。审查时按 [审查清单](references/review.md) 逐项看。
5. **汇报。** 说明做了什么、哪些没有验证。不要因为这份 skill 就提高项目的最低系统版本、引入新的 UI 库或改动无关的页面。

## 不要做

- 加品牌色、渐变、彩色图标，或用 emoji 当图标。
- 在 SwiftUI 端给系统工具栏、侧边栏加实色背景盖掉玻璃；在 Web 应用里用模糊效果模仿玻璃。
- 给卡片加阴影；在玻璃上放正文或列表。
- 给界面文字、AI 回答或按钮用衬线；到处用粗体。
- 浮层只有出现动画、关闭时一下子消失；用 `@keyframes` 做开合。
- 用上下内边距撑出按钮高度；为了凑 44 点击区域把可见的按钮做大；用 `padding-top`、`top: 1px` 或等高的 `line-height` 凑垂直居中。
- 把官网的大按钮、大字号搬进应用界面；把桌面档的尺寸直接搬到触屏上。
- 一屏出现两个主按钮；用「确定」「OK」当按钮文字。
- 只靠颜色表达状态。

## 版本与更新

通过 `npx @deernova/style` 安装时，同一目录下的 `manifest.json` 记录版本和内容哈希；更新运行 `npx @deernova/style@latest update`。不要直接修改安装后的文件，规范的源文件在 deernova-style 仓库的 `skills/deernova-style/`。
