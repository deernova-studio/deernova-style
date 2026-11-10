# 线条

用线条代替阴影来分组。这里包括线宽（多粗）和线形（实线、虚线、端点）。数值见 [设计变量](../tokens.md) 的「线宽」和「线形」。

## 线宽

| Token | 值 | 用途 |
| --- | --- | --- |
| `stroke-line` | 1px | 分隔线、卡片、输入区、侧边栏和顶栏的边线 |
| `stroke-control` | 1px | 确实需要边界的自绘控件，不用于普通输入框或激活态 |
| `stroke-focus` | 2px | 键盘焦点环的粗细 |
| `focus-offset` | 2px | 焦点环和控件之间的空隙；贴着容器的元素向内画 |
| `icon-stroke` | 1.75 | 线性图标在 24×24 viewBox 里的描边（仅网页） |

- 线统一是 1px（高分屏上 2 个物理像素），清楚、不发虚。
- 确实需要边界的控件用 `stroke-control` 加 `line-control` 色；装饰性的线用 `stroke-line` 加 `line` 色。
- 输入框、下拉框和 Composer 用 `stroke-line` 加 `line` 浅线，不用深色边线；聚焦时浅线不变，换成 `surface-raised` 底加 `shadow-control`，不画焦点环。
- 其他控件用键盘聚焦时画焦点环：`outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset);`，见 [交互状态](states.md)。
- SwiftUI 里自己画的边框（卡片、Composer、任务清单）用 1pt；系统自带的分隔线（`Divider()`、`List` 的行分隔）保持系统样式，不去改。

## 线形

| Token | 值 | 用途 |
| --- | --- | --- |
| `line-style-divider` | solid | 分隔线、卡片等必要的边线。普通输入框不描边 |
| `line-style-dropzone` | dashed | 拖放区、待添加的占位块 |
| `line-dash` | 4 4 | SVG 虚线的 `stroke-dasharray`（仅网页） |
| `line-cap` / `line-join` | round | 图标和自绘线条的端点和拐角 |

- 只有“还空着、等你放东西进来”的区域用虚线。不要用虚线做装饰或分隔。
- 图标、图表里自绘的线一律圆角端点、圆角拐角。

## 规则

- 侧边栏和内容区之间、顶栏和内容之间各一条线；列表分隔线从文字起点开始，不贯穿到左边缘。
- 区块之间一条线就够，不要用双线或粗线强调。
- 卡片用线描边，不加阴影；选中用底色区分，边线保持 `line`，不改成黑色。
