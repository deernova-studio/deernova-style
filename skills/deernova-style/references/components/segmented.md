# 分段控件

在同一份数据的 2–4 种视图或范围之间切换。

**需要提供**：选项列表（每项 2–4 个字，或者一个图标）和绑定的选中值。

## 尺寸

<!-- tokens:segmented -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `segmented-height` | 24 | 28 | 28 | 选项块的高度；外层再加上下各 segmented-padding。 |
| `segmented-padding` | 2 | 2 | 2 | 底槽内边距。 |
| `segmented-padding-x` | 12 | 16 | 16 | 选项块左右内边距。 |
| `segmented-font-size` | 13 | 14 | 14 | 选项字号。 |
| `segmented-radius` | 6 | 胶囊 | 胶囊 | 底槽圆角；选项块圆角 = 它减去 segmented-padding。 |
<!-- /tokens -->

- 底槽 `fill-selected`；选中块 `surface-raised` 加 `shadow-control`；未选中文字 `ink-secondary`，选中文字 `ink`。
- 选中块的圆角 = `segmented-radius` − `segmented-padding`，两层同心。指针端是小圆角矩形，触控端是胶囊。
- 选项等宽或按文字宽度排列都可以，同一个控件里保持一致。

## Web

用一组 `button` 加 `aria-pressed`；如果它切换的是一组面板，改用 `role="tablist"` 和 `role="tab"`。

```css
.dn-segmented {
  display: inline-flex;
  gap: 2px;
  padding: var(--segmented-padding);
  border-radius: var(--segmented-radius);
  background: var(--fill-selected);
}
.dn-segmented button {
  position: relative;
  height: var(--segmented-height);
  padding: 0 var(--segmented-padding-x);
  border: 0;
  border-radius: calc(var(--segmented-radius) - var(--segmented-padding));
  background: transparent;
  color: var(--ink-secondary);
  font: var(--weight-medium) var(--segmented-font-size)/1 var(--font-sans);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--duration-instant) var(--ease-standard), color var(--duration-instant) var(--ease-standard);
}
.dn-segmented button:hover { color: var(--ink); }
.dn-segmented button[aria-pressed="true"], .dn-segmented button[aria-selected="true"] { background: var(--surface-raised); color: var(--ink); box-shadow: var(--shadow-control); }
.dn-segmented button:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset); }
```

```html
<div class="dn-segmented" role="group" aria-label="视图">
  <button type="button" aria-pressed="true">列表</button>
  <button type="button" aria-pressed="false">卡片</button>
  <button type="button" aria-pressed="false">日历</button>
</div>
```

## SwiftUI

直接用系统控件就能得到上面的效果，不需要自己画。

```swift
Picker("视图", selection: $mode) {
    Text("列表").tag(Mode.list)
    Text("卡片").tag(Mode.cards)
    Text("日历").tag(Mode.calendar)
}
.pickerStyle(.segmented)
.labelsHidden()
```

## 不要

- 选项超过 4 个（改用菜单或下拉选择）。
- 拿它当执行动作的按钮组。
- 选项文字长短差别太大。
