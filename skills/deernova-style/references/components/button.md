# 按钮

按钮执行一个动作。每个视图最多一个主按钮（`accent` 填充：浅色主题黑底白字，深色主题白底黑字），用来完成这一屏存在的理由。

**需要提供**：标签（动词开头）、可选的图标、点击动作；加载中和禁用状态。

## 变体

- **主按钮** `is-primary`：`accent` 底、`on-accent` 字。保存、发送、购买这类关键动作，一屏最多一个。
- **次按钮**（默认）：`fill-selected` 灰底、无描边、无阴影、`ink` 字。半透明的灰底放在任何纸面上都成立。
- **文字按钮** `is-plain`：无底，`ink-secondary` 字，悬停时出现 `fill-hover`。工具栏和卡片里的次要操作。
- **危险按钮** `is-danger`：`danger-soft` 底、`danger` 字。只有在最终的[危险确认弹窗](sheet.md)里，才用实色的危险样式 `is-primary is-danger`：`danger` 底、`on-accent` 字（SwiftUI 的 `role: .destructive`）。
- **图标按钮** `dn-icon-button`：只有图标，无底，`ink-secondary`，必须有无障碍标签；有鼠标或触控板时用 [tooltip](tooltip.md) 显示它的名称。

## 尺寸

<!-- tokens:button -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `button-height-sm` | 24 | 30 | 32 | 小按钮的可见高度：列表行、卡片角落里的行内操作。 |
| `button-height-md` | 28 | 36 | 36 | 默认按钮、图标按钮、发送按钮、步骤行的高度。 |
| `button-height-lg` | 32 | 46 | 44 | 大按钮：空状态、引导页；触屏上用作整页唯一的通栏主按钮。 |
| `button-padding-x-sm` | 8 | 12 | 14 | 小按钮左右内边距。上下内边距永远是 0。 |
| `button-padding-x-md` | 12 | 16 | 18 | 默认按钮左右内边距。 |
| `button-padding-x-lg` | 16 | 20 | 24 | 大按钮左右内边距。 |
| `button-font-size-sm` | 12 | 13 | 13 | 小按钮字号。 |
| `button-font-size-md` | 14 | 15 | 14 | 默认按钮字号。 |
| `button-font-size-lg` | 14 | 16 | 15 | 大按钮字号。 |
| `button-font-weight` | 500 | 600 | 500 | 按钮字重。 |
| `button-radius` | 6 | 胶囊 | 胶囊 | 默认和大按钮的圆角：桌面档是 radius-sm，触控档和官网是胶囊。 |
| `button-radius-sm` | 4 | 胶囊 | 胶囊 | 小按钮的圆角。 |
<!-- /tokens -->

高度只由 `button-height-*` 决定：**上下内边距为 0，文字行高为 1**。按钮里的文字不能继承页面的行高，否则按钮会跟着页面行高变高。

可见高度小于 `hit-min` 时（触控档的 30 和 36），点击区域用透明的命中区补足到 44，可见的按钮不变大。

**怎么选尺寸**：按按钮所在的位置定，不随意挑。

- 列表行、卡片角落里的行内操作（获取、关注、打开）→ 小号 `is-sm`。
- 页面和卡片里的普通按钮，包括并排的两个按钮（以后再说 / 开启）→ 默认。同一行里的按钮用同一个尺寸。
- 空状态、引导页的操作 → 大号 `is-lg`。触屏上整页唯一的底部主操作（登录、订阅、开始使用）用大号加 `is-block` 通栏，一屏最多一个。
- 导航栏、标签栏、工具栏里的按钮 → 用系统控件或[玻璃操作层](glass-controls.md)，不自己设尺寸。

触控档比桌面档大是有意的：手指比鼠标指针粗。三种尺寸放在手机里的样子见 `assets/screens/iphone-button-sizes-light.png`。

## 状态

- 悬停：次按钮在灰底上再叠一层 `fill-hover`，文字按钮出现 `fill-hover`，主按钮不透明度降到 `opacity-solid-hover`。
- 按下：次按钮灰底加深，文字按钮用 `fill-selected`，主按钮用 `opacity-solid-hover`；不添加描边或外圈。
- 焦点：用键盘聚焦（`:focus-visible`）时画焦点环：`stroke-focus` 粗的 `focus-ring`，离按钮 `focus-offset`，圆角跟着按钮。底色和不透明度不变；鼠标点击时不出现。
- 禁用：`opacity-disabled`，保持原位，不隐藏。
- 加载：按钮宽度不变，把标签换成转圈，`aria-busy="true"`。

## Web

```css
.dn-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap-inline);
  height: var(--button-height-md);
  padding: 0 var(--button-padding-x-md); /* 上下永远是 0：高度只由 height 决定 */
  border: 0;
  border-radius: var(--button-radius);
  background: var(--fill-selected);
  color: var(--ink);
  font: var(--button-font-weight) var(--button-font-size-md)/1 var(--font-sans); /* 行高 1，不继承页面行高 */
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--duration-instant) var(--ease-standard), opacity var(--duration-instant) var(--ease-standard);
}
@media (hover: hover) { .dn-button:hover:not(:disabled) { background-image: linear-gradient(var(--fill-hover), var(--fill-hover)); } }
.dn-button:active:not(:disabled) { background-image: linear-gradient(var(--fill-selected), var(--fill-selected)); }
.dn-button:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset); }
.dn-button:disabled { opacity: var(--opacity-disabled); cursor: default; }

.dn-button.is-primary { background: var(--accent); color: var(--on-accent); }
@media (hover: hover) { .dn-button.is-primary:hover:not(:disabled) { background-image: none; opacity: var(--opacity-solid-hover); } }
.dn-button.is-primary:active:not(:disabled) { background-image: none; opacity: var(--opacity-solid-hover); }
.dn-button.is-plain { background: transparent; color: var(--ink-secondary); }
@media (hover: hover) { .dn-button.is-plain:hover:not(:disabled) { background: var(--fill-hover); color: var(--ink); } }
.dn-button.is-plain:active:not(:disabled) { background: var(--fill-selected); color: var(--ink); }
.dn-button.is-danger { background: var(--danger-soft); color: var(--danger); }
.dn-button.is-primary.is-danger { background: var(--danger); color: var(--on-accent); }

.dn-button.is-sm { height: var(--button-height-sm); padding: 0 var(--button-padding-x-sm); border-radius: var(--button-radius-sm); font-size: var(--button-font-size-sm); }
.dn-button.is-lg { height: var(--button-height-lg); padding: 0 var(--button-padding-x-lg); font-size: var(--button-font-size-lg); }
.dn-button.is-block { width: 100%; }
.dn-button .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }

.dn-icon-button {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex: none;
  width: var(--button-height-md);
  height: var(--button-height-md);
  padding: 0;
  border: 0;
  border-radius: var(--button-radius);
  background: transparent;
  color: var(--ink-secondary);
  cursor: pointer;
  transition: background-color var(--duration-instant) var(--ease-standard);
}
@media (hover: hover) { .dn-icon-button:hover { background: var(--fill-hover); color: var(--ink); } }
.dn-icon-button:active { background: var(--fill-selected); color: var(--ink); }
.dn-icon-button:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset); }

/* 点击区域：可见尺寸不变，用透明的伪元素把可点范围撑到 hit-min。
   不要用 padding 补：padding 在背景里面，会把可见的按钮一起撑大。 */
.dn-button::before, .dn-icon-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, var(--hit-min));
  height: max(100%, var(--hit-min));
  transform: translate(-50%, -50%);
}
```

```html
<div class="dn-row">
  <button class="dn-button is-primary" type="button">保存</button>
  <button class="dn-button" type="button">取消</button>
  <button class="dn-button is-plain" type="button">跳过</button>
  <button class="dn-button is-danger" type="button">删除</button>
  <button class="dn-button is-primary" type="button" disabled>保存</button>
  <button class="dn-icon-button" type="button" aria-label="搜索"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg></button>
</div>
<div class="dn-row">
  <button class="dn-button is-sm" type="button">获取</button>
  <button class="dn-button" type="button"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>新建笔记</button>
  <button class="dn-button is-primary is-lg" type="button">开始使用</button>
</div>
```

## SwiftUI

macOS 直接用系统按钮，`.controlSize(.regular)` 就是 24pt。iOS 的可见高度和点击区域分开处理。

```swift
Button("保存") { save() }
    .buttonStyle(.borderedProminent)       // 主按钮，颜色跟随 .tint(.brandAccent)
Button("取消", role: .cancel) { dismiss() }
    .buttonStyle(.bordered)
Button("删除", role: .destructive) { delete() }

// iOS 默认按钮：看起来 36pt，点击区域补足到 44pt
Button("继续") { next() }
    .font(.subheadline.weight(.semibold))
    .buttonStyle(.borderedProminent)
    .buttonBorderShape(.capsule)
    .controlSize(.regular)
    .padding(.vertical, (Deernova.hitMin - Deernova.buttonHeightMd) / 2) // 写在 buttonStyle 之后，是透明的
    .contentShape(.rect)

// iOS 底部通栏主按钮
Button { start() } label: {
    Text("开始使用").font(.callout.weight(.semibold))
        .frame(maxWidth: .infinity, minHeight: Deernova.buttonHeightLg)
}
.buttonStyle(.borderedProminent)
.buttonBorderShape(.capsule)

// 加载中：宽度不变，标签换成转圈
Button { save() } label: {
    ZStack { Text("保存").opacity(isSaving ? 0 : 1); if isSaving { ProgressView() } }
}
```

放在玻璃层上时改用 `.glassProminent` / `.glass`，见 [玻璃操作层](glass-controls.md)。

## 不要

- 用上下内边距撑出按钮高度，或让按钮继承页面的行高。
- 为了凑 44 点击区域把可见的按钮做成 44 高。
- 给次按钮加描边和阴影（它是一块灰底，不是浮起来的卡片）。
- 一个视图里放两个主按钮；为了强调把次要按钮也做成黑底。
- 用「确定」「OK」做标签；按钮里写一整句话。
- 把官网的胶囊大按钮搬进应用界面。
