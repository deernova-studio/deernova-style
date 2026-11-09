# 分组列表与设置页

分组列表，用于设置页、详情页和各种表单：一组组白色的列表浮在 `canvas` 上。

**需要提供**：分组，每个分组可以有页头和页脚说明；每一行提供标题，以及可选的图标、右侧的值、开关或箭头，点击后跳转或执行动作。

## 尺寸

<!-- tokens:list -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `row-icon-size` | 20 | 28 | 24 | 列表行左侧图标底的边长。 |
| `switch-width` | 36 | 51 | 44 | 开关宽度。 |
| `switch-height` | 20 | 31 | 24 | 开关高度；圆钮直径 = 高度 − 4。 |
<!-- /tokens -->

行高、行内边距沿用[侧边栏](sidebar.md)的 `row-height`、`row-padding-x`；分组圆角沿用[卡片](card.md)的 `card-radius`。

- 页面底色 `canvas`，分组底色 `surface-raised`，分组之间 `gap-group`。
- 每行最小高度 `row-height`，文字 `type-body`、`ink`；右侧的值用 `ink-secondary`，箭头用 `ink-tertiary`。
- 图标放在边长 `row-icon-size` 的方块里，`accent-soft` 底、`ink` 图标、`radius-sm`。整个列表统一用灰色，不要每行一个颜色。
- 分隔线 `stroke-line`、`line` 色，从文字起点开始。
- 页头 `footnote` 字号、`ink-secondary`；页脚 `footnote` 字号、`ink-tertiary`，写清楚这个设置会带来什么后果。
- 开关打开时用 `success`。不要用黑白色调的开关：深色主题下白色轨道会把白色圆钮吞掉。

## Web

什么时候用开关、复选框还是单选，见[选择控件](choice.md)。开关用原生的 `<input type="checkbox" role="switch">`，保留键盘和读屏支持。

```css
.dn-list-section { display: grid; gap: 6px; }
.dn-list-header, .dn-list-footer { margin: 0; padding: 0 var(--row-padding-x); font: var(--weight-regular) var(--type-footnote-size)/var(--type-footnote-line) var(--font-sans); }
.dn-list-header { color: var(--ink-secondary); }
.dn-list-footer { color: var(--ink-tertiary); }
.dn-list { margin: 0; padding: 0; overflow: hidden; list-style: none; border-radius: var(--card-radius); background: var(--surface-raised); }
.dn-list-row {
  --separator-inset: var(--row-padding-x);
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--row-height);
  padding: 0 var(--row-padding-x);
  color: var(--ink);
  font: var(--type-body);
}
.dn-list-row.has-icon { --separator-inset: calc(var(--row-padding-x) + var(--row-icon-size) + var(--space-3)); }
.dn-list-row + .dn-list-row::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  left: var(--separator-inset);
  border-top: var(--stroke-line) var(--line-style-divider) var(--line);
}
.dn-list-icon { display: grid; place-items: center; flex: none; width: var(--row-icon-size); height: var(--row-icon-size); border-radius: var(--radius-sm); background: var(--accent-soft); color: var(--ink); }
.dn-list-icon .dn-icon { width: calc(var(--row-icon-size) * 0.6); height: calc(var(--row-icon-size) * 0.6); }
.dn-list-value { margin-left: auto; color: var(--ink-secondary); white-space: nowrap; }
.dn-list-row .dn-chevron { width: var(--icon-size-sm); height: var(--icon-size-sm); color: var(--ink-tertiary); }

.dn-switch {
  position: relative;
  flex: none;
  width: var(--switch-width);
  height: var(--switch-height);
  margin: 0 0 0 auto;
  border-radius: var(--radius-full);
  background: var(--fill-selected);
  appearance: none;
  cursor: pointer;
  transition: background-color var(--duration-base) var(--ease-standard);
}
.dn-switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(var(--switch-height) - 4px);
  height: calc(var(--switch-height) - 4px);
  border-radius: var(--radius-full);
  background: var(--knob);
  box-shadow: var(--shadow-control);
  transition: transform var(--duration-base) var(--ease-standard);
}
.dn-switch:checked { background: var(--success); }
.dn-switch:checked::after { transform: translateX(calc(var(--switch-width) - var(--switch-height))); }
.dn-switch:focus-visible { outline: none; filter: brightness(0.85); }
```

```html
<section class="dn-list-section">
  <h3 class="dn-list-header">同步</h3>
  <ul class="dn-list">
    <li class="dn-list-row has-icon"><span class="dn-list-icon"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg></span>个人资料<span class="dn-list-value">林一</span><svg class="dn-icon dn-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></li>
    <li class="dn-list-row has-icon"><span class="dn-list-icon"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18z"/></svg></span><label for="sync">iCloud 同步</label><input class="dn-switch" id="sync" type="checkbox" role="switch" checked></li>
  </ul>
  <p class="dn-list-footer">关闭 iCloud 同步后，新笔记只保存在这台设备上。</p>
</section>
```

## SwiftUI

```swift
Form {
    Section("账号") {
        NavigationLink { ProfileView() } label: {
            LabeledContent { Text("林一") } label: { Label("个人资料", systemImage: "person") }
        }
    }
    Section {
        Toggle(isOn: $iCloudSync) { Label("iCloud 同步", systemImage: "icloud") }
            .tint(.success)
    } header: {
        Text("同步")
    } footer: {
        Text("关闭 iCloud 同步后，新笔记只保存在这台设备上。")
    }
}
.scrollContentBackground(.hidden)
.background(.canvas)
.tint(.brandAccent)
```

Mac 上的设置窗口同样用 `Form` 加 `.formStyle(.grouped)`，系统会给出对应的 Mac 样式。

## 不要

- 每行用不同颜色的图标。
- 页脚写成一大段。
- 在列表行里放主按钮（主按钮放在页面底部）。
