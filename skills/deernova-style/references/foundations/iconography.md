# 图标

图标是灰色的线性符号，粗细跟随旁边的文字。

## 尺寸

<!-- tokens:icon -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `icon-size-sm` | 14 | 17 | 16 | 按钮和标签里的图标。 |
| `icon-size-md` | 16 | 20 | 18 | 侧边栏、列表、横幅、工具栏里的图标。 |
| `icon-size-lg` | 20 | 24 | 24 | 玻璃按钮、标签栏里的图标。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `icon-stroke` | `1.75px` | 线性图标在 24×24 viewBox 里的描边宽度，接近 SF Symbols 的常规粗细。（仅网页） |
<!-- /tokens -->

## 规则

- App 里只用 SF Symbols，和系统保持一致。13pt 文字旁的图标用 `.medium`，看起来更清楚。
- Web 上用线条粗细接近 SF Symbols 的线性图标：24×24 viewBox、`icon-stroke` 描边、圆角端点和拐角（`line-cap`、`line-join`）、无填充。不用 emoji 当图标。
- 默认颜色 `ink-secondary`，选中态和主操作用 `ink`。图标不用彩色，状态图标除外。
- 状态图标固定为：成功 `checkmark.circle.fill`，警告 `exclamationmark.triangle.fill`，错误 `xmark.octagon.fill`，提示 `info.circle.fill`。Web 上用同样形状的线性图标。
- 只有图标的按钮必须有无障碍标签（`aria-label`，或 SwiftUI 的 `Button("搜索", systemImage:)` 加 `.labelStyle(.iconOnly)`）。

## Web 写法

```css
.dn-icon {
  width: var(--icon-size-md);
  height: var(--icon-size-md);
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: var(--icon-stroke);
  stroke-linecap: var(--line-cap);
  stroke-linejoin: var(--line-join);
}
```

```html
<svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg>
```
