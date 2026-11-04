# 圆角

圆角刻度是固定值；每个组件用哪一档，由组件的 `*-radius` token 按密度决定。数值见 [设计变量](../tokens.md) 的「圆角」和「组件尺寸」。

## 刻度

| Token | 值 | 典型用途 |
| --- | --- | --- |
| `radius-xs` | 4 | 标签、复选框、小按钮 |
| `radius-sm` | 6 | 桌面端的按钮、输入框、工具栏图标按钮 |
| `radius-md` | 8 | 侧边栏选中块、代码块、弹出菜单 |
| `radius-lg` | 12 | 卡片、用户消息气泡、分组列表、任务清单 |
| `radius-xl` | 24 | 底部弹窗、触控端单行 Composer |
| `radius-full` | 999 | 胶囊和圆形：触控端按钮、玻璃按钮、状态圆点 |

## 按场景

- 桌面端（Web 应用、macOS 内容区）：按钮和输入框 6，侧边栏选中块 8，提示条 10，卡片、气泡、任务清单 12，Composer 14。小的东西圆角小，大的容器圆角大。
- 触控端（iOS、iPadOS、Web 触屏）：按钮是胶囊，卡片和分组列表 12，底部弹窗 24。
- 官网：按钮是胶囊，卡片 12。

这些差异已经写进 `button-radius`、`field-radius`、`row-radius`、`banner-radius`、`card-radius`、`composer-radius`、`sheet-radius` 等组件 token，直接用它们，不要在代码里按平台判断。

## 同心

嵌套时保持同心：内圆角 = 外圆角 − 内边距。例如分段控件的底槽 `segmented-radius` 是 6、内边距 2，选中块就是 4。SwiftUI 里用 `ConcentricRectangle()`，内层会自动和外层同心。

## 不要

- 在一个界面里混用多种无关的圆角。
- 嵌套的圆角内外一样大（内层看起来会“胖”出来）。
