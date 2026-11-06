# 层级与阴影

阴影就是层级：只有真正浮起来的东西才有阴影。数值见 [设计变量](../tokens.md) 的「阴影」和「层级」。

| 层 | 是什么 | 阴影 | 叠放顺序 |
| --- | --- | --- | --- |
| 0 纸面 | `canvas`、`surface`，以及用 1px 线分隔的侧边栏、顶栏、内容块、卡片 | 无 | 默认 |
| 1 控件厚度 | 分段控件的选中块、开关圆钮 | `shadow-control` | 默认 |
| 2 浮层 | Composer、弹出菜单、弹窗、浮动面板 | `shadow-float` | `z-dropdown`、`z-overlay` |
| 玻璃 | SwiftUI 端的工具栏、标签栏、浮动按钮；官网页眉 | 系统玻璃自带；官网页眉用 `shadow-glass` | `z-sticky` |
| 提示 | 轻提示 | 跟随玻璃 | `z-toast` |
| Tooltip | tooltip、悬停卡片 | `shadow-float` | `z-tooltip` |

- 卡片不加阴影。卡片和纸面的区分靠 `line` 线和亮度差。
- Web 应用的顶栏是不透明的纸面，吸顶时用 `z-sticky`，底部一条 `stroke-line`，不加阴影。
- 弹窗背后用 `scrim` 压暗内容。
- z-index 只用这几档，不要写 9999 这类数字。SwiftUI 里叠放交给系统的 sheet、popover、overlay。
- 深色主题下阴影更重（不透明度更高），因为深色纸面上浅阴影看不见；这已经写在两套主题的值里。
