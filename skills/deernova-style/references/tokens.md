# 设计变量

由 `assets/tokens.json` 生成（在 deernova-style 仓库里运行 `npm run tokens`），不要手改。同一份数据还生成了 `assets/tokens.css`（CSS 变量）、`assets/tailwind.css`（Tailwind v4 主题）和 `assets/DeernovaTokens.swift`（SwiftUI）。CSS 变量名和这里的 token 名一致，例如 `var(--ink)`、`var(--button-height-md)`。

每个 token 的值只取决于两件事：**主题**（浅色 / 深色）和**密度**（紧凑 / 常规 / 触控 / 舒展）。token 名字里不出现平台，平台差异全部放在值里。

## 场景与密度

| 场景 | 密度 | 输入 | 怎么启用 | 读这里 |
| --- | --- | --- | --- | --- |
| Web 应用 | 桌面（`desktop`） | 指针 | tokens.css 的默认值 | [scenes/web.md](scenes/web.md) |
| Web 触屏 | 触控（`touch`） | 触摸 | `@media (pointer: coarse)` 自动切换 | [scenes/web.md](scenes/web.md) |
| macOS | 桌面（`desktop`） | 指针 | 系统控件用系统尺寸；内容区用 `DeernovaTokens.swift` 的 `#if os(macOS)` | [scenes/macos.md](scenes/macos.md) |
| iOS | 触控（`touch`） | 触摸 | `DeernovaTokens.swift` 的 `#else` | [scenes/ios.md](scenes/ios.md) |
| iPadOS | 触控（`touch`） | 触摸和指针 | 同 iOS；分栏布局另见场景说明 | [scenes/ipados.md](scenes/ipados.md) |
| 官网与文档 | 舒展（`comfortable`） | 指针 | 根元素加 `data-density="comfortable"` | [scenes/web-marketing.md](scenes/web-marketing.md) |

| 密度 | 说明 |
| --- | --- |
| 桌面（`desktop`） | 指针操作。tokens.css 的默认值：正文 15/24，控件 28，侧边栏行 32。macOS 的侧边栏、工具栏、菜单用系统控件和系统尺寸，自己画的内容区用这一档。 |
| 触控（`touch`） | 手指操作。正文 17pt，按钮看起来 36pt，点击区域至少 44pt。 |
| 舒展（`comfortable`） | 以阅读为主。字号和留白更大，控件只用于少量导航。 |

## 原始色板

原始色板。名字里的数字是 HSL 亮度（0 黑，100 白）。只在 tokens.json 里被语义颜色引用，代码里不要直接用。

| Token | 值 |
| --- | --- |
| `gray-100` | `#ffffff` |
| `gray-98` | `#fafafa` |
| `gray-96` | `#f5f5f5` |
| `gray-93` | `#ededed` |
| `gray-92` | `#ebebeb` |
| `gray-91` | `#e8e8e8` |
| `gray-89` | `#e3e3e3` |
| `gray-64` | `#a3a3a3` |
| `gray-55` | `#8c8c8c` |
| `gray-54` | `#8a8a8a` |
| `gray-45` | `#737373` |
| `gray-40` | `#666666` |
| `gray-32` | `#525252` |
| `gray-18` | `#2f2f2f` |
| `gray-15` | `#252525` |
| `gray-11` | `#1c1c1c` |
| `gray-9` | `#171717` |
| `gray-7` | `#111111` |
| `teal-90` | `#ddeeec` |
| `teal-59` | `#6cc3b4` |
| `teal-27` | `#1f6b66` |
| `teal-15` | `#183230` |
| `amber-89` | `#f5ead3` |
| `amber-61` | `#e2b054` |
| `amber-29` | `#8a5a0b` |
| `amber-16` | `#3a2e17` |
| `crimson-93` | `#f7e1e4` |
| `crimson-71` | `#f07a8a` |
| `crimson-42` | `#b0283f` |
| `crimson-18` | `#3d2027` |
| `blue-92` | `#e1ebf3` |
| `blue-69` | `#82b4dc` |
| `blue-35` | `#2c5f86` |
| `blue-17` | `#1d2c3a` |

## 颜色

语义颜色，按主题取值。代码里只用这些名字。
“= `ink`” 表示这个变量直接引用另一个语义颜色。

| Token | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| `canvas` | `gray-96` `#f5f5f5` | `gray-9` `#171717` | 窗口底色、Web 应用的内容区、分组列表的底色。最底层的纸面。 |
| `surface` | `gray-98` `#fafafa` | `gray-11` `#1c1c1c` | 卡片、侧边栏（比内容区亮一层）。 |
| `surface-raised` | `gray-100` `#ffffff` | `gray-15` `#252525` | 输入框、Composer、用户消息气泡、分组列表、弹出层。最亮的纸面。 |
| `surface-sunken` | `gray-92` `#ebebeb` | `gray-7` `#111111` | 代码块、展开的步骤详情。凹下去的纸面。 |
| `ink` | `gray-9` `#171717` | `gray-93` `#ededed` | 正文与标题，在四种纸面上不低于 13:1。 |
| `ink-secondary` | `gray-32` `#525252` | `gray-64` `#a3a3a3` | 次要文字、说明、列表的值、未选中的图标，在四种纸面上不低于 6:1。 |
| `ink-tertiary` | `gray-40` `#666666` | `gray-55` `#8c8c8c` | 占位符、时间戳、计数、分组标题，在四种纸面上不低于 4.5:1。 |
| `line` | `gray-89` `#e3e3e3` | `gray-18` `#2f2f2f` | 分隔线、卡片描边、按钮描边。装饰性，不承载信息。 |
| `line-control` | `gray-54` `#8a8a8a` | `gray-45` `#737373` | 需要明确边界的自绘控件、拖拽条、链接下划线。在 canvas、surface、surface-raised 上不低于 3:1；普通输入框用底色区分，不用它描边。 |
| `accent` | = `ink` | = `ink` | 强调：主按钮填充、选中指示。就是墨色本身，浅色主题是黑，深色主题是白；不用来画激活或焦点外框。 |
| `accent-soft` | `gray-91` `#e8e8e8` | `gray-18` `#2f2f2f` | 强调的浅底：列表图标底。上面的文字用 ink；不用作输入框的聚焦外圈。 |
| `on-accent` | `gray-100` `#ffffff` | `gray-9` `#171717` | accent 填充上的文字和图标：浅色主题白字，深色主题黑字。 |
| `focus-ring` | `gray-45` `#737373` | `gray-64` `#a3a3a3` | 仅兼容旧版焦点环。新界面不用这个 token 描边；输入框聚焦不变，键盘导航用底色或文字提示。 |
| `success` | `teal-27` `#1f6b66` | `teal-59` `#6cc3b4` | 成功、已完成、已同步、开关打开。作为文字用在纸面和 success-soft 上。 |
| `success-soft` | `teal-90` `#ddeeec` | `teal-15` `#183230` | 成功状态的浅底（标签、横幅）。 |
| `warning` | `amber-29` `#8a5a0b` | `amber-61` `#e2b054` | 需要注意但不阻断：额度将用完、网络较慢。 |
| `warning-soft` | `amber-89` `#f5ead3` | `amber-16` `#3a2e17` | 警告状态的浅底。 |
| `danger` | `crimson-42` `#b0283f` | `crimson-71` `#f07a8a` | 错误、失败、删除。永远同时配图标或文字。 |
| `danger-soft` | `crimson-93` `#f7e1e4` | `crimson-18` `#3d2027` | 错误状态的浅底、危险按钮的底色。 |
| `info` | `blue-35` `#2c5f86` | `blue-69` `#82b4dc` | 中性提示。 |
| `info-soft` | `blue-92` `#e1ebf3` | `blue-17` `#1d2c3a` | 提示状态的浅底。 |
| `fill-hover` | `#0000000a` | `#ffffff0f` | 悬停底色，叠在任何纸面上（列表行、文字按钮、侧边栏项）。 |
| `fill-selected` | `#00000017` | `#ffffff26` | 选中底色：侧边栏当前项、分段控件底槽、次按钮、中性标签底。比悬停明显，一眼能看出当前在哪。 |
| `knob` | `gray-100` `#ffffff` | `gray-100` `#ffffff` | 开关的圆钮，两套主题都是白色，与系统一致。 |
| `scrim` | `#00000052` | `#00000080` | 弹窗背后压暗内容的遮罩。 |
| `glass-fill` | `#ffffffa6` | `#2a2a2aa6` | 仅官网与文档的页眉：用 backdrop-filter 近似玻璃。Web 应用不用玻璃；App 里用系统玻璃。 |
| `glass-stroke` | `#ffffffcc` | `#ffffff24` | 仅官网与文档的页眉：玻璃边缘的高光描边。 |

## 字体

字号按角色组织，每个角色在三种密度下各有一组字号和行高。界面文字和 AI 回答都用无衬线；衬线只给 display、title 和文章类长文 prose。iOS 用文本样式，让动态字体生效。

| 字族 | CSS 变量 | 字体栈 |
| --- | --- | --- |
| serif | `--font-serif` | `ui-serif, "New York", "Iowan Old Style", Georgia, "PingFang SC", serif` |
| sans | `--font-sans` | `-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif` |
| mono | `--font-mono` | `ui-monospace, "SF Mono", Menlo, "PingFang SC", monospace` |

### 字重

| Token | 值 | 用途 |
| --- | --- | --- |
| `weight-regular` | `400` | 正文、说明、输入的文字。 |
| `weight-medium` | `500` | 按钮、标签、侧边栏选中项、表单标签。 |
| `weight-semibold` | `600` | 标题、区块标题、列表行标题。不用 700 以上。 |

### 字号角色

每个角色生成 `--type-<角色>`（`font` 简写，可以直接写 `font: var(--type-body)`）、`--type-<角色>-size` 和 `--type-<角色>-line`。表里是“字号 / 行高”。

| 角色 | 字族 | 字重 | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | SwiftUI（macOS · iOS） | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `display` | serif | 600 | 26 / 32 | 30 / 36 | 44 / 52 | `.system(size: 26, weight: .semibold, design: .serif)` · `.system(.largeTitle, design: .serif).weight(.semibold)` | 空状态、引导页、页面的大标题（衬线）。每屏最多一个。 |
| `title` | serif | 600 | 18 / 24 | 20 / 25 | 24 / 32 | `.system(size: 18, weight: .semibold, design: .serif)` · `.system(.title3, design: .serif).weight(.semibold)` | 文章标题、弹窗标题（衬线）。 |
| `headline` | sans | 600 | 15 / 22 | 17 / 22 | 16 / 24 | `.system(size: 15, weight: .semibold)` · `.headline` | 区块标题、卡片标题、横幅标题、列表行标题。 |
| `body` | sans | 400 | 15 / 24 | 17 / 23 | 15 / 24 | `.system(size: 15)` · `.body` | 界面正文、AI 回答、用户消息、列表、表单。 |
| `prose` | serif | 400 | 16 / 26 | 17 / 26 | 17 / 28 | `.system(size: 16, design: .serif)` · `.system(.body, design: .serif)` | 文章、文档这类长文阅读（衬线）。AI 回答不用它。 |
| `callout` | sans | 400 | 14 / 20 | 15 / 20 | 14 / 22 | `.system(size: 14)` · `.callout` | 说明文字、弹窗正文、AI 输入框右下方的模型、权限和上下文用量。 |
| `footnote` | sans | 400 | 13 / 18 | 13 / 17 | 13 / 20 | `.system(size: 13)` · `.footnote` | 侧边栏分组标题、分组列表的页头页脚、卡片摘要。 |
| `caption` | sans | 400 | 12 / 16 | 12 / 15 | 12 / 16 | `.system(size: 12)` · `.caption` | 时间戳、计数、标签。界面里最小的字。 |
| `code` | mono | 400 | 13 / 20 | 13 / 18 | 13 / 20 | `.system(size: 13, design: .monospaced)` · `.system(.footnote, design: .monospaced)` | 代码块、命令、文件路径、需要对齐的数据。 |

## 间距

4pt 网格。刻度是固定值；语义间距按密度取值。组与组之间的间距至少是组内的 2 倍。

| Token | 值 | 用途 |
| --- | --- | --- |
| `space-1` | `4px` | 图标与文字之间、标题与摘要之间。 |
| `space-2` | `8px` | 列表项内边距、横幅上下内边距、卡片网格间距。 |
| `space-3` | `12px` | 卡片内边距、横幅左右内边距。 |
| `space-4` | `16px` | 内容区里段落、工具调用行、卡片之间。 |
| `space-5` | `20px` | 分组之间、区块之间。 |
| `space-6` | `24px` | 空状态内边距、大区块之间。 |
| `space-8` | `32px` | 页面级留白。 |
| `space-10` | `40px` | 引导页、首屏的留白。 |
| `space-12` | `48px` | 官网与文档的章节间距。 |
| `space-16` | `64px` | 官网首屏的上下留白。 |

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `gap-inline` | 6 | 6 | 8 | 同一行里图标和文字之间、按钮里图标和标签之间。 |
| `gap-stack` | 8 | 8 | 12 | 同一组里相邻元素之间：表单项、卡片里的段落、并排的按钮。 |
| `gap-group` | 24 | 20 | 48 | 组与组之间：设置分组、页面区块。至少是 gap-stack 的 2 倍。 |
| `page-margin` | 32 | 16 | 32 | 页面和内容区的左右边距。 |

## 圆角

圆角刻度。各组件实际用哪一档见组件尺寸里的 *-radius。嵌套保持同心：内圆角 = 外圆角 − 内边距。

| Token | 值 | 用途 |
| --- | --- | --- |
| `radius-xs` | `4px` | 标签、复选框、小按钮。 |
| `radius-sm` | `6px` | 桌面端的按钮、输入框、工具栏图标按钮。 |
| `radius-md` | `8px` | 侧边栏选中块、代码块、弹出菜单。 |
| `radius-lg` | `12px` | 卡片、用户消息气泡、分组列表、任务清单。 |
| `radius-xl` | `24px` | 底部弹窗、触控端单行 Composer。 |
| `radius-full` | `999px` | 胶囊与圆形：触控端按钮、玻璃按钮、状态圆点。 |

## 线宽

线宽。

| Token | 值 | 用途 |
| --- | --- | --- |
| `stroke-line` | `1px` | 分隔线、卡片、输入区、侧边栏和顶栏的边线。SwiftUI 里自己画的边框用 1pt，系统自带的分隔线保持系统样式。 |
| `stroke-control` | `1px` | 确实需要边界的控件描边；普通输入框、下拉框和激活态不画深色边框。 |
| `stroke-focus` | `2px` | 仅兼容旧版焦点环宽度，新界面不使用环形描边。 |
| `focus-offset` | `2px` | 仅兼容旧版焦点环偏移，新界面不使用环形描边。 |

## 线形

线形：线条画成什么样。

| Token | 值 | 用途 |
| --- | --- | --- |
| `line-style-divider` | `solid` | 分隔线、卡片等必要的边线。普通输入框不描边；界面里的线默认都是实线。 |
| `line-style-dropzone` | `dashed` | 拖放区、待添加的占位块。只有这类“还空着”的区域用虚线。 |
| `line-dash` | `4 4` | SVG 虚线的 stroke-dasharray。（仅网页） |
| `line-cap` | `round` | 图标和自绘线条的端点。 |
| `line-join` | `round` | 图标和自绘线条的拐角。 |

## 阴影

阴影表达层级，不用于激活装饰；输入框聚焦不添加阴影。

| Token | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| `shadow-control` | `0 1px 1px rgba(0, 0, 0, 0.05)` | `0 1px 1px rgba(0, 0, 0, 0.30)` | 第 1 层：次按钮、分段控件的选中块，一点点厚度。 |
| `shadow-float` | `0 1px 2px rgba(0, 0, 0, 0.05), 0 6px 20px rgba(0, 0, 0, 0.08)` | `0 1px 2px rgba(0, 0, 0, 0.40), 0 6px 20px rgba(0, 0, 0, 0.45)` | 第 2 层：Composer、弹出菜单、弹窗、浮动面板。 |
| `shadow-glass` | `0 4px 14px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.70)` | `0 4px 14px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.10)` | 仅网页：模拟玻璃的阴影和顶部高光。App 里系统玻璃自带阴影。 |

## 层级

叠放顺序（z-index）。和阴影的层级一一对应。

| Token | 值 | 用途 |
| --- | --- | --- |
| `z-sticky` | `10` | 吸顶的工具栏和页眉。 |
| `z-dropdown` | `100` | 弹出菜单、下拉列表、popover。 |
| `z-overlay` | `1000` | 遮罩和弹窗。 |
| `z-toast` | `1100` | 轻提示，压在弹窗之上。 |
| `z-tooltip` | `1200` | tooltip 和悬停卡片，压在所有层之上。 |

## 动效

动效时长和缓动。进入用 ease-enter，退出用 ease-exit 并降一档时长，从屏幕边缘滑入的面板用 ease-drawer。SwiftUI 里默认用 .smooth（等同 .spring(response: 0.35, dampingFraction: 0.85) 的手感）。

| Token | 值 | 用途 |
| --- | --- | --- |
| `duration-instant` | `120ms` | 悬停、按压、选中这类即时反馈；tooltip 的进出；菜单、popover 的退出。 |
| `duration-base` | `200ms` | 菜单、popover、轻提示的进入；展开收起；弹窗和抽屉的退出。 |
| `duration-slow` | `320ms` | 弹窗、底部弹窗、侧边抽屉的进入，页面级转场。 |
| `ease-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 状态变化和展开收起：颜色、高度、箭头旋转。快进、缓停。 |
| `ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | 出现：菜单、popover、弹窗、轻提示。起步快、停得很柔，前一半时间就完成大部分位移。 |
| `ease-exit` | `cubic-bezier(0.4, 0, 0.2, 1)` | 消失：配比进入低一档的时长，不拖泥带水。 |
| `ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | 从屏幕边缘滑入滑出的面板：侧边抽屉、底部弹窗，进出都用它。 |

## 不透明度

不透明度。

| Token | 值 | 用途 |
| --- | --- | --- |
| `opacity-disabled` | `0.35` | 禁用的控件。禁用时保持原位，不隐藏。 |
| `opacity-solid-hover` | `0.88` | 实色（accent 填充）按钮悬停和按下。 |

## 玻璃

仅官网与文档的页眉：用 backdrop-filter 近似 Liquid Glass。Web 应用不用玻璃，App 里用系统玻璃。

| Token | 值 | 用途 |
| --- | --- | --- |
| `glass-blur` | `16px` | 官网页眉玻璃背后的模糊半径。（仅网页） |
| `glass-saturate` | `1.4` | 官网页眉玻璃背后的饱和度增强。（仅网页） |

## 布局

布局尺寸。断点只能写在媒体查询里，所以不生成 CSS 变量。

| Token | 值 | 用途 |
| --- | --- | --- |
| `content-max` | `680px` | 对话栏和长文阅读栏的最大宽度。 |
| `form-max` | `560px` | 表单页、设置页内容栏的最大宽度。 |
| `wide-max` | `1120px` | 表格、看板和官网内容的最大宽度。 |
| `breakpoint-sm` | `760px` | 窄屏：侧边栏收起，多栏变单栏。 |
| `breakpoint-md` | `960px` | 中等宽度：目录和次要栏收起。 |
| `breakpoint-lg` | `1280px` | 宽屏：内容不再继续变宽，两侧留白。 |
| `scrollbar-size` | `10px` | 网页滚动条占的宽度（横向滚动条是高度）。（仅网页） |
| `scrollbar-thumb-size` | `6px` | 滚动条里胶囊滑块的粗细，两边各留 (scrollbar-size − 它) ÷ 2。（仅网页） |

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `hit-min` | 24 | 44 | 24 | 最小点击区域。可见尺寸比它小时，用透明的命中区补足，不加大可见的按钮。 |
| `sidebar-width` | 288 | 320 | 260 | 侧边栏默认宽度。iPhone 没有侧边栏；macOS 用系统侧边栏，宽度只作参考。 |
| `sidebar-width-min` | 200 | 260 | 200 | 侧边栏拖动时的最小宽度。 |
| `sidebar-width-max` | 400 | 400 | 320 | 侧边栏拖动时的最大宽度。 |
| `pane-width` | 320 | 360 | 320 | 列表加详情里列表栏的默认宽度，也是右侧 inspector 的默认宽度。 |
| `toolbar-height` | 44 | 44 | 52 | Web 应用顶栏、侧面板标签头的高度。macOS 用系统工具栏。 |
| `grid-gutter` | 24 | 16 | 32 | 官网和文档 12 栏网格的栏间距。应用里的卡片网格用 card-gap。 |

## 组件尺寸

按密度取值。每个组件的完整规格和写法见对应的组件说明。

### 按钮

见 [components/button.md](components/button.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `button-height-sm` | 24 | 30 | 32 | 小按钮的可见高度：列表行、卡片角落里的行内操作。 |
| `button-height-md` | 28 | 36 | 36 | 默认按钮、图标按钮、发送按钮、步骤行的高度。 |
| `button-height-lg` | 32 | 46 | 44 | 大按钮：空状态、引导页；触控端是整页唯一的通栏主按钮。 |
| `button-padding-x-sm` | 8 | 12 | 14 | 小按钮左右内边距。上下内边距永远是 0。 |
| `button-padding-x-md` | 12 | 16 | 18 | 默认按钮左右内边距。 |
| `button-padding-x-lg` | 16 | 20 | 24 | 大按钮左右内边距。 |
| `button-font-size-sm` | 12 | 13 | 13 | 小按钮字号。 |
| `button-font-size-md` | 14 | 15 | 14 | 默认按钮字号。 |
| `button-font-size-lg` | 14 | 16 | 15 | 大按钮字号。 |
| `button-font-weight` | 500 | 600 | 500 | 按钮字重。 |
| `button-radius` | 6 | 胶囊 | 胶囊 | 默认和大按钮的圆角：指针端是 radius-sm，触控端和官网是胶囊。 |
| `button-radius-sm` | 4 | 胶囊 | 胶囊 | 小按钮的圆角。 |

### 顶栏与侧面板

见 [components/toolbar.md](components/toolbar.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `toolbar-title-size` | 15 | 17 | 15 | 顶栏标题字号（常规字重）。 |
| `panel-tab-height` | 28 | 36 | 32 | 侧面板标签头里每个标签的高度。 |

### 玻璃操作层

见 [components/glass-controls.md](components/glass-controls.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `glass-button-size` | 34 | 44 | 36 | 玻璃按钮的边长：macOS 26 工具栏按钮约 34（系统绘制，这里只作参考和自绘时对齐），官网页眉的图标按钮也用它；按钮组里的按钮比它小 8。Web 应用的工具栏不用玻璃，用 button-height-md。 |

### 分段控件

见 [components/segmented.md](components/segmented.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `segmented-height` | 24 | 28 | 28 | 选项块的高度；外层再加上下各 segmented-padding。 |
| `segmented-padding` | 2 | 2 | 2 | 底槽内边距。 |
| `segmented-padding-x` | 12 | 16 | 16 | 选项块左右内边距。 |
| `segmented-font-size` | 13 | 14 | 14 | 选项字号。 |
| `segmented-radius` | 6 | 胶囊 | 胶囊 | 底槽圆角；选项块圆角 = 它减去 segmented-padding。 |

### 文本框

见 [components/text-field.md](components/text-field.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `field-height` | 28 | 44 | 40 | 单行输入框和下拉选择的高度。 |
| `field-padding-x` | 10 | 12 | 14 | 输入框左右内边距。 |
| `field-font-size` | 14 | 17 | 15 | 输入文字字号。触控端不小于 16，避免浏览器放大页面。 |
| `field-radius` | 6 | 8 | 8 | 输入框圆角。 |
| `field-action-size` | 20 | 32 | 28 | 输入框内部图标按钮（清除、显示密码）的可见尺寸，四周离边缘相等；命中区用 hit-min 补足。 |

### Composer 输入区（AI 输入框）

见 [components/composer.md](components/composer.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `composer-radius` | 14 | 24 | 16 | Composer 外框圆角。 |
| `composer-min-height` | 44 | 44 | 48 | 单行布局的高度：加号、输入、发送排在同一行，输入多行时向上长高。 |
| `composer-thumb-size` | 48 | 56 | 56 | 图片附件缩略图的边长。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `composer-attachment-max-width` | `240px` | 文件附件条的最大宽度，文件名放不下时中间省略。 |

### 提及与命令

见 [components/mention.md](components/mention.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `mention-height` | 20 | 24 | 22 | 文字里提及标签的高度，放进正文的一行里不撑高行距。 |
| `mention-padding-x` | 4 | 6 | 6 | 提及标签左右内边距。 |
| `mention-radius` | 4 | 6 | 6 | 提及标签圆角。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `suggest-width` | `360px` | @、/、# 建议浮层的宽度；窄屏时和 Composer 同宽。 |

### 侧边栏与列表行

见 [components/sidebar.md](components/sidebar.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `row-height` | 32 | 44 | 40 | 侧边栏项、列表行的最小高度。 |
| `row-padding-x` | 10 | 16 | 12 | 行的左右内边距；分隔线从这里开始。 |
| `row-radius` | 8 | 10 | 8 | 悬停和选中底色的圆角。 |
| `row-gap` | 2 | 0 | 2 | 侧边栏项之间的间隔。触控端的列表用分隔线，不留间隔。 |

### 分组列表与设置页

见 [components/list.md](components/list.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `row-icon-size` | 20 | 28 | 24 | 列表行左侧图标底的边长。 |
| `switch-width` | 36 | 51 | 44 | 开关宽度。 |
| `switch-height` | 20 | 31 | 24 | 开关高度；圆钮直径 = 高度 − 4。 |

### 卡片

见 [components/card.md](components/card.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `card-padding-x` | 16 | 16 | 24 | 卡片左右内边距。 |
| `card-padding-y` | 12 | 14 | 24 | 卡片上下内边距。 |
| `card-radius` | 12 | 12 | 12 | 卡片、分组列表、任务清单的圆角。 |
| `card-gap` | 12 | 12 | 16 | 卡片网格的间距。 |

### 标签

见 [components/tag.md](components/tag.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `tag-height` | 20 | 22 | 24 | 标签高度。 |
| `tag-padding-x` | 6 | 8 | 10 | 标签左右内边距。 |
| `tag-font-size` | 12 | 12 | 12 | 标签字号。 |
| `tag-radius` | 4 | 胶囊 | 胶囊 | 标签圆角。 |

### 代码块

见 [components/code-block.md](components/code-block.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `code-header-height` | 32 | 36 | 36 | 代码块表头的高度。 |

### 任务清单

见 [components/task-list.md](components/task-list.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `task-row-height` | 28 | 44 | 32 | 任务清单每一行的高度。 |
| `task-glyph-size` | 16 | 20 | 18 | 左侧状态圈的直径。 |

### 空状态

见 [components/empty-state.md](components/empty-state.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `empty-title-size` | 24 | 20 | 32 | 空状态标题（衬线）字号。 |
| `empty-icon-size` | 32 | 36 | 40 | 空状态图标的边长。 |

### 横幅与轻提示

见 [components/banner.md](components/banner.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `toast-height` | 36 | 40 | 40 | 轻提示胶囊的高度。 |
| `banner-radius` | 10 | 12 | 12 | 横幅和贴在输入区上方的提示条的圆角。 |

### 菜单与下拉

见 [components/menu.md](components/menu.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `menu-item-height` | 28 | 44 | 36 | 菜单项和下拉选项的高度。 |
| `menu-item-padding-x` | 8 | 10 | 10 | 菜单项左右内边距。 |
| `menu-font-size` | 14 | 17 | 15 | 菜单项字号。 |
| `menu-padding` | 4 | 6 | 6 | 菜单面板的内边距，也是分隔线上下的间距。 |
| `menu-radius` | 8 | 12 | 12 | 菜单和 popover 的圆角；菜单项的圆角 = 它减去 menu-padding。 |
| `menu-offset` | 4 | 8 | 8 | 菜单和触发它的控件之间的距离。 |
| `menu-min-width` | 160 | 220 | 200 | 菜单最小宽度；同时不窄于触发器。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `menu-max-width` | `320px` | 菜单最大宽度；放不下的文字用省略号。 |

### 弹窗、抽屉与 popover

见 [components/sheet.md](components/sheet.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `sheet-width-sm` | 360 | 360 | 400 | 确认弹窗、只有一两句话的提示。 |
| `sheet-width-md` | 480 | 540 | 560 | 默认宽度：短表单、选择分享方式这类短任务。 |
| `sheet-width-lg` | 720 | 720 | 800 | 预览、较长的设置，或分两栏的内容。 |
| `sheet-padding` | 20 | 20 | 24 | 弹窗内边距；标题、内容和按钮区都和它对齐。 |
| `sheet-margin` | 32 | 8 | 32 | 弹窗离窗口边缘的最小距离；触控端底部弹窗悬浮时离屏幕边缘的距离。 |
| `sheet-radius` | 12 | 24 | 16 | 弹窗和底部弹窗的圆角。 |
| `popover-padding` | 12 | 16 | 16 | popover 的内边距；圆角用 menu-radius，宽度不超过 sheet-width-sm。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `sheet-grabber-width` | `36px` | 底部弹窗顶部拖拽条的宽度。 |
| `sheet-grabber-height` | `5px` | 拖拽条的高度。 |

### Tooltip 与悬停浮层

见 [components/tooltip.md](components/tooltip.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `tooltip-height` | 24 | 28 | 28 | 单行 tooltip 的高度；折成两行时随内容长高。 |
| `tooltip-padding-x` | 8 | 10 | 10 | tooltip 左右内边距。 |
| `tooltip-font-size` | 12 | 13 | 13 | tooltip 字号。 |
| `tooltip-radius` | 6 | 8 | 8 | tooltip 圆角。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `tooltip-offset` | `8px` | tooltip 和触发它的控件之间的距离。 |
| `tooltip-max-width` | `240px` | tooltip 最大宽度，超过时折行，最多两行。 |
| `tooltip-delay` | `500ms` | 指针停留多久后显示 tooltip 和悬停卡片。SwiftUI 的 .help() 用系统的时间。（仅网页） |
| `tooltip-skip-window` | `300ms` | 一个 tooltip 刚关闭的这段时间里，移到相邻控件立即显示，不再等待。（仅网页） |

### 消息

见 [components/message.md](components/message.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `message-font-size` | 15 | 15 | 15 | 用户消息气泡的字号。AI 回答用 type-body，和界面正文一致。 |
| `message-action-size` | 24 | 32 | 28 | AI 消息下方操作按钮的可见尺寸。 |
| `cite-height` | 16 | 18 | 18 | 正文里引用角标的高度。 |

### 确认与审批

见 [components/approval.md](components/approval.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `diff-line-height` | 20 | 22 | 22 | 变更对比里每一行的高度。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `diff-gutter-width` | `40px` | 变更对比左侧行号栏的宽度。 |
| `approval-code-max-height` | `160px` | 确认卡里命令、参数块的最大高度，超出时内部滚动。 |

### 图标

见 [foundations/iconography.md](foundations/iconography.md)。

| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `icon-size-sm` | 14 | 17 | 16 | 按钮和标签里的图标。 |
| `icon-size-md` | 16 | 20 | 18 | 侧边栏、列表、横幅、工具栏里的图标。 |
| `icon-size-lg` | 20 | 24 | 24 | 玻璃按钮、标签栏里的图标。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `icon-stroke` | `1.75px` | 线性图标在 24×24 viewBox 里的描边宽度，接近 SF Symbols 的常规粗细。（仅网页） |
