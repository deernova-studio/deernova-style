# 设计变量

由 `assets/tokens.json` 生成（在 deernova-style 仓库里运行 `npm run tokens`），不要手改。CSS 版本是 `assets/tokens.css`，变量名和这里一致，例如 `var(--ink)`；SwiftUI 里按同名建 Color Set，见 [SwiftUI 落地](swiftui.md)。

“= `ink`” 表示这个变量直接引用另一个变量。

## 颜色

| Token | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| `canvas` | `#f5f5f5` | `#161616` | 窗口底色、iOS 分组列表的底色。最底层的纸面。 |
| `surface` | `#fafafa` | `#1c1c1c` | 内容区、卡片。比 canvas 略亮一层。 |
| `surface-raised` | `#ffffff` | `#252525` | 输入框、Composer、iOS 分组列表、弹出层。最亮的纸面。 |
| `surface-sunken` | `#ebebeb` | `#111111` | 代码块、用户消息气泡、展开的步骤详情。凹下去的纸面。 |
| `ink` | `#171717` | `#ededed` | 正文与标题，用在四种纸面上（最低 13:1）。 |
| `ink-secondary` | `#525252` | `#a3a3a3` | 次要文字、说明、列表的值、未选中图标，用在四种纸面上（最低 6:1）。 |
| `ink-tertiary` | `#666666` | `#8c8c8c` | 占位符、时间戳、计数、分组标题，用在四种纸面上（最低 4.5:1）。 |
| `line` | `#e3e3e3` | `#2f2f2f` | 分隔线、卡片描边、按钮描边。装饰性，不承载信息。 |
| `line-control` | `#8a8a8a` | `#737373` | 输入框边框、拖拽条。在 canvas、surface、surface-raised 上不低于 3:1，让人一眼看出可输入。 |
| `accent` | = `ink` | = `ink` | 强调：主按钮填充、选中指示、焦点环。就是墨色本身，浅色主题为黑、深色主题为白；强调靠明暗对比，不靠彩色。 |
| `accent-soft` | `#e8e8e8` | `#2e2e2e` | 强调的浅底：强调标签、列表图标底、输入框聚焦光晕。上面的文字用 ink。 |
| `on-accent` | `#ffffff` | `#161616` | accent 填充上的文字和图标：浅色主题白字，深色主题黑字。 |
| `focus-ring` | = `accent` | = `accent` | 键盘焦点环：2pt 实线，外偏移 2pt。在所有纸面上不低于 13:1。 |
| `success` | `#1f6b66` | `#6cc3b4` | 成功、已完成、已同步。界面里只有状态色是彩色，只在表达状态时出现。作为文字用在纸面和 success-soft 上。 |
| `success-soft` | `#ddeeec` | `#183230` | 成功状态的浅底（标签、横幅）。 |
| `warning` | `#8a5a0b` | `#e2b054` | 需要注意但不阻断：额度将用完、网络较慢。作为文字用在纸面和 warning-soft 上。 |
| `warning-soft` | `#f5ead3` | `#3a2e17` | 警告状态的浅底。 |
| `danger` | `#b0283f` | `#f07a8a` | 错误、失败、删除。永远同时配图标或文字。作为文字用在纸面和 danger-soft 上。 |
| `danger-soft` | `#f7e1e4` | `#3d2027` | 错误状态的浅底、危险按钮的底色。 |
| `info` | `#2c5f86` | `#82b4dc` | 中性提示。作为文字用在纸面和 info-soft 上。 |
| `info-soft` | `#e1ebf3` | `#1d2c3a` | 提示状态的浅底。 |
| `fill-hover` | `#0000000a` | `#ffffff0f` | 悬停底色，叠在任何纸面上（列表行、文字按钮、侧边栏项）。 |
| `fill-selected` | `#00000012` | `#ffffff1a` | 选中底色（侧边栏当前项、分段控件底槽、中性标签底）。 |
| `knob` | `#ffffff` | `#ffffff` | 开关的圆钮，两套主题都是白色，与系统一致。 |
| `scrim` | `#00000052` | `#00000080` | 弹窗背后压暗内容的遮罩。 |
| `glass-fill` | `#ffffffa6` | `#2a2a2aa6` | 仅用于网页预览模拟 Liquid Glass。App 里用系统 .glassEffect()，不要用这个值自己画玻璃。 |
| `glass-stroke` | `#ffffffcc` | `#ffffff24` | 仅用于网页预览：玻璃边缘的高光描边。 |

## 字体

只用系统字体，不打包字体文件。

| 字族 | CSS 变量 | 字体栈 |
| --- | --- | --- |
| serif | `--font-serif` | `ui-serif, "New York", "Iowan Old Style", Georgia, "PingFang SC", serif` |
| sans | `--font-sans` | `-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif` |
| mono | `--font-mono` | `ui-monospace, "SF Mono", Menlo, "PingFang SC", monospace` |

### macOS

Mac 正文 13pt，行高收紧到约 1.4 倍。衬线只用于标题和长文阅读，界面文字一律无衬线。

| 样式 | 字族 | 字号 / 行高 | 字重 | 用途 |
| --- | --- | --- | --- | --- |
| `mac-display` | serif | 22px / 28px | 600 | 空状态、引导页的大标题。每屏最多一个。SwiftUI: .system(size: 22, weight: .semibold, design: .serif) |
| `mac-title` | serif | 17px / 22px | 600 | 文章标题、设置页标题。SwiftUI: .system(.title3, design: .serif).weight(.semibold) |
| `mac-headline` | sans | 13px / 17px | 600 | 窗口标题、区块标题、横幅标题。SwiftUI: .headline |
| `mac-body` | sans | 13px / 18px | 400 | 界面正文、按钮、列表、表单、用户消息。SwiftUI: .body |
| `mac-prose` | serif | 14px / 22px | 400 | 长文阅读、AI 回答。栏宽不超过 content-max。 |
| `mac-callout` | sans | 12px / 16px | 400 | 表单说明、卡片摘要、次要信息。SwiftUI: .callout |
| `mac-caption` | sans | 11px / 13px | 500 | 时间戳、计数、侧边栏分组标题、标签。SwiftUI: .caption |

### iOS

iOS 正文保持系统默认的 17pt，让动态字体正常缩放，只收紧行高和标题。

| 样式 | 字族 | 字号 / 行高 | 字重 | 用途 |
| --- | --- | --- | --- | --- |
| `ios-large-title` | serif | 30px / 36px | 600 | 页面大标题。SwiftUI: .system(.largeTitle, design: .serif).weight(.semibold) |
| `ios-title` | serif | 20px / 25px | 600 | 弹窗标题、文章标题、空状态标题。SwiftUI: .system(.title3, design: .serif) |
| `ios-headline` | sans | 17px / 22px | 600 | 列表行标题、卡片标题、按钮。SwiftUI: .headline |
| `ios-body` | sans | 17px / 23px | 400 | 界面正文、列表行。SwiftUI: .body |
| `ios-prose` | serif | 17px / 26px | 400 | 长文阅读、AI 回答。SwiftUI: .system(.body, design: .serif)，行距 .lineSpacing(4) |
| `ios-callout` | sans | 15px / 20px | 400 | 说明文字、弹窗正文、用户消息。SwiftUI: .callout |
| `ios-footnote` | sans | 13px / 17px | 400 | 分组列表的页头页脚、卡片摘要。SwiftUI: .footnote |
| `ios-caption` | sans | 12px / 15px | 500 | 时间戳、计数、标签。SwiftUI: .caption |

### Code

代码、命令、文件路径、数据。

| 样式 | 字族 | 字号 / 行高 | 字重 | 用途 |
| --- | --- | --- | --- | --- |
| `code-mac` | mono | 12px / 17px | 400 | Mac 上的代码块、步骤摘要。SwiftUI: .system(.callout, design: .monospaced) |
| `code-ios` | mono | 13px / 18px | 400 | iOS 上的代码块。SwiftUI: .system(.footnote, design: .monospaced) |

## 间距

4pt 网格，整体偏紧凑。组与组之间的间距至少是组内间距的 2 倍。

| Token | 值 | 用途 |
| --- | --- | --- |
| `space-1` | `4px` | 图标与文字之间、卡片内标题与摘要之间。 |
| `space-2` | `8px` | Mac 列表项内边距、横幅上下内边距、Composer 内边距。 |
| `space-3` | `12px` | Mac 按钮左右内边距、卡片内边距、横幅左右内边距。 |
| `space-4` | `16px` | Mac 内容区边距、对话中消息之间、iOS 页面左右边距。 |
| `space-5` | `20px` | iOS 分组之间、Mac 区块之间。 |
| `space-6` | `24px` | 空状态内边距、大区块之间。 |
| `space-8` | `32px` | 页面级留白。 |
| `space-10` | `40px` | 引导页、首屏的大留白。 |

## 圆角

嵌套保持同心：内圆角 = 外圆角 − 内边距。

| Token | 值 | 用途 |
| --- | --- | --- |
| `radius-xs` | `4px` | 标签、复选框、分段控件里的选中块（外层 radius-sm、内边距 2）。 |
| `radius-sm` | `6px` | Mac 按钮、输入框、侧边栏选中块、iOS 列表图标底。 |
| `radius-md` | `8px` | Mac 卡片、横幅、代码块、弹出菜单。 |
| `radius-lg` | `12px` | iOS 卡片、iOS 分组列表、Composer、用户消息气泡、Mac 侧边栏面板。 |
| `radius-xl` | `24px` | iOS 底部弹窗、iOS 单行 Composer。 |
| `radius-full` | `999px` | 胶囊与圆形：玻璃按钮、iOS 主按钮、发送按钮、状态圆点。 |

## 线宽

线宽。

| Token | 值 | 用途 |
| --- | --- | --- |
| `stroke-hairline` | `0.5px` | 分隔线、卡片描边：1 个物理像素。SwiftUI: 1 / displayScale。 |
| `stroke-control` | `1px` | 输入框边框。 |
| `stroke-focus` | `2px` | 焦点环。 |

## 尺寸

控件高度与布局尺寸。Mac 偏紧凑，iOS 遵守 44pt 最小点击区域。

| Token | 值 | 用途 |
| --- | --- | --- |
| `control-mac-sm` | `20px` | Mac 小按钮、行内操作、分段控件。 |
| `control-mac` | `24px` | Mac 默认按钮、输入框、图标按钮、步骤行。 |
| `control-mac-lg` | `28px` | Mac 大按钮（引导页、空状态）。 |
| `row-mac` | `26px` | Mac 侧边栏项、列表行。 |
| `control-ios` | `44px` | iOS 最小可点区域（按钮看起来可以更小，点击区域仍补足到 44）、列表行、输入框、导航栏玻璃按钮。 |
| `button-ios-sm` | `30px` | iOS 小按钮的可见高度：卡片和列表里的「获取」「关注」这类行内操作。 |
| `button-ios` | `36px` | iOS 默认按钮的可见高度。 |
| `control-ios-lg` | `46px` | iOS 通栏主按钮（页面底部、弹窗里的唯一主操作）。 |
| `sidebar-mac` | `220px` | Mac 侧边栏默认宽度。 |
| `content-max` | `680px` | 长文阅读栏的最大宽度，14pt 下约每行 45 个汉字。 |

## 阴影

卡片不加阴影。只有真正浮起来的东西才有阴影。

| Token | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| `shadow-control` | `0 1px 1px rgba(0, 0, 0, 0.05)` | `0 1px 1px rgba(0, 0, 0, 0.30)` | 次按钮、分段控件的选中块：一点点厚度。 |
| `shadow-float` | `0 1px 2px rgba(0, 0, 0, 0.05), 0 6px 20px rgba(0, 0, 0, 0.08)` | `0 1px 2px rgba(0, 0, 0, 0.40), 0 6px 20px rgba(0, 0, 0, 0.45)` | Composer、弹出菜单、弹窗、浮动面板。 |
| `shadow-glass` | `0 4px 14px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.70)` | `0 4px 14px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.10)` | 仅用于网页预览模拟玻璃。App 里系统玻璃自带阴影。 |
