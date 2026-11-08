# 文本框

单行文字输入，配一个标签和一句说明。

**需要提供**：标签（名词）、绑定的文本、可选的占位符（给示例，不要重复标签）、说明文字，校验失败时提供错误信息。

## 尺寸

<!-- tokens:text-field -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `field-height` | 28 | 44 | 40 | 单行输入框和下拉选择的高度。 |
| `field-padding-x` | 10 | 12 | 14 | 输入框左右内边距。 |
| `field-font-size` | 14 | 17 | 15 | 输入文字字号。触控端不小于 16，避免浏览器放大页面。 |
| `field-radius` | 6 | 8 | 8 | 输入框圆角。 |
| `field-action-size` | 20 | 32 | 28 | 输入框内部图标按钮（清除、显示密码）的可见尺寸，四周离边缘相等；命中区用 hit-min 补足。 |
<!-- /tokens -->

- 默认用 `surface-sunken` 浅底表示可输入区域，`border: 0`，不画深色边线。
- 聚焦前后外观保持一致，只出现输入光标；不换底色，不加描边、外圈、阴影或动画。鼠标点入和键盘进入使用同样的规则。
- 出错时用 `danger-soft` 底色，说明文字换成 `danger` 色的错误信息。聚焦仍保留错误底色；错误信息要说清楚怎么改，不依赖一圈红边。
- 标签在输入框上方，`callout` 字号、中粗、`ink-secondary`；说明在下方，`caption` 字号、常规字重、`ink-tertiary`。标签、输入框、说明之间 `space-1`。
- 触控端输入文字不小于 16px，避免浏览器在聚焦时放大页面（`field-font-size` 已经保证）。
- 下拉选择（`select`）和输入框同高，共用浅底，聚焦不额外加装饰，写法见 [菜单与下拉](menu.md)。

## 占位符

- 写一个真实的例子或格式，例如「name@example.com」「2026-11-08」「搜索笔记」；不重复标签，不写「请输入……」。
- 一句短语，不加句号；放不下时用省略号截断，不折行。
- 颜色 `ink-tertiary`（在 `surface-sunken` 上也不低于 4.5:1），字号、字重、位置和输入后的文字完全相同，输入第一个字时文字不跳动。
- 占位符一输入就消失，所以必须让用户记住的要求（格式、长度、是否必填）写在标签或下方说明里，不能只写在占位符里。
- 搜索框没有标签时，占位符说清搜索范围（「搜索全部笔记」），同时给输入框一个 `aria-label`。

## 内部布局

从左到右固定这个顺序，没有的部分直接省略：

| 位置 | 内容 | 规格 |
| --- | --- | --- |
| 前置图标 | 搜索、链接、日历这类说明用途的图标 | `icon-size-md`，`ink-tertiary`，不可点 |
| 前缀 | 固定的文字，例如「https://」「¥」 | `field-font-size`，`ink-tertiary` |
| 输入文字 | 用户输入的内容或占位符 | `field-font-size`，`ink` |
| 后缀 | 单位，例如「px」「天」「%」 | `field-font-size`，`ink-tertiary` |
| 操作按钮 | 清除、显示密码、复制 | `field-action-size` 的图标按钮，最多两个 |
| 快捷键提示 | 搜索框空着时显示「⌘K」 | `caption` 字号，`ink-tertiary`，输入后隐藏 |

- 左右内边距都是 `field-padding-x`；图标、前后缀、文字、按钮之间都是 `gap-inline`。有操作按钮时，右侧内边距改成按钮离上下边缘的距离，让按钮四周留白相等。
- 清除按钮只在有内容时出现，占的位置提前留好，出现和消失都不改变文字区域的宽度。
- 整个输入框都是点击区域：点到图标、前后缀或空白处，光标也进入文字。
- 出错、禁用时整块一起变化：错误用 `danger-soft` 底，禁用整体降到 `opacity-disabled`；前后缀和图标跟着一起变，不单独变色。

## 对齐

- **垂直**：所有内容在 `field-height` 里垂直居中；输入文字行高 1.2，不用上下内边距去凑。前缀、文字、后缀字号相同，自然在同一基线上。占位符和输入后的文字位置一致。
- **水平**：文字左对齐。金额、数量、百分比这类数字右对齐，用等宽数字（`tabular-nums`），单位作为后缀跟在右边；验证码这类固定长度的数字可以居中，用等宽数字和稍宽的字距。
- **和外部对齐**：输入框文字的左边缘和上方标签、下方说明的左边缘不对齐也没关系，但同一表单里所有输入框的左边缘必须对齐；和按钮同排时，两者同高（都用桌面 28），按中线对齐。
- **多行文本框**：第一行文字的位置和单行输入框一致（上内边距 =（`field-height` − 行高）÷ 2），行高 1.5；最少 3 行，随内容长高到最多 8 行后在内部滚动，只能纵向拖动调整大小。字数统计放在下方说明的右侧，`caption` 字号、`ink-tertiary`，接近上限时变 `warning`，超出时变 `danger`。
- **宽度**：按预期内容定宽。表单里默认占满表单栏（不超过 `form-max`）；邮编、数量这类短内容可以窄一些，但不要窄到放不下占位符。

## Web

```css
.dn-field { display: grid; gap: var(--space-1); min-width: 0; }
.dn-field-label { color: var(--ink-secondary); font: var(--weight-medium) var(--type-callout-size)/var(--type-callout-line) var(--font-sans); }
.dn-input {
  box-sizing: border-box;
  width: 100%;
  height: var(--field-height);
  padding: 0 var(--field-padding-x);
  border: 0;
  border-radius: var(--field-radius);
  background: var(--surface-sunken);
  color: var(--ink);
  font: var(--weight-regular) var(--field-font-size)/1.2 var(--font-sans);
}
.dn-input::placeholder { color: var(--ink-tertiary); }
.dn-input:focus { outline: none; box-shadow: none; }
.dn-input[aria-invalid="true"] { background: var(--danger-soft); }
.dn-input:disabled { opacity: var(--opacity-disabled); }
.dn-field-help { color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); }
.dn-field-help.is-error { color: var(--danger); }
.dn-field-foot { display: flex; gap: var(--space-3); }
.dn-field-foot > .dn-field-help:first-child { flex: 1; min-width: 0; }
.dn-field-count { color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); font-variant-numeric: tabular-nums; }
.dn-input-group {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--gap-inline);
  width: 100%;
  height: var(--field-height);
  padding: 0 var(--field-padding-x);
  border-radius: var(--field-radius);
  background: var(--surface-sunken);
  color: var(--ink-tertiary);
  cursor: text;
}
.dn-input-group:has(.dn-input-action) { padding-inline-end: calc((var(--field-height) - var(--field-action-size)) / 2); }
.dn-input-group > input { flex: 1; min-width: 0; height: 100%; padding: 0; border: 0; outline: none; background: transparent; color: var(--ink); font: var(--weight-regular) var(--field-font-size)/1.2 var(--font-sans); }
.dn-input-group > input::placeholder { color: var(--ink-tertiary); }
.dn-input-group > input:focus { outline: none; box-shadow: none; }
.dn-input-group > .dn-icon { flex: none; width: var(--icon-size-md); height: var(--icon-size-md); }
.dn-input-affix { flex: none; font: var(--weight-regular) var(--field-font-size)/1.2 var(--font-sans); white-space: nowrap; }
.dn-input-kbd { flex: none; font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); }
.dn-input-group > input:not(:placeholder-shown) ~ .dn-input-kbd { display: none; }
.dn-input-action {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  width: var(--field-action-size);
  height: var(--field-action-size);
  padding: 0;
  border: 0;
  border-radius: calc(var(--field-radius) - (var(--field-height) - var(--field-action-size)) / 4);
  background: transparent;
  color: var(--ink-tertiary);
  cursor: pointer;
}
.dn-input-action::before { content: ""; position: absolute; inset: 50% auto auto 50%; width: max(100%, var(--hit-min)); height: max(100%, var(--hit-min)); transform: translate(-50%, -50%); }
.dn-input-action .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
@media (hover: hover) { .dn-input-action:hover { background: var(--fill-hover); color: var(--ink); } }
.dn-input-action:active, .dn-input-action:focus-visible { outline: none; background: var(--fill-selected); color: var(--ink); }
.dn-input-group > input:placeholder-shown ~ .dn-input-action.is-clear { visibility: hidden; }
.dn-input-group:has(> input[aria-invalid="true"]) { background: var(--danger-soft); }
.dn-input-group:has(> input:disabled) { opacity: var(--opacity-disabled); cursor: default; }
.dn-input-group > input.is-number, .dn-input.is-number { text-align: end; font-variant-numeric: tabular-nums; }
textarea.dn-input {
  height: auto;
  min-height: calc(var(--field-font-size) * 1.5 * 3 + var(--field-height) - var(--field-font-size) * 1.5);
  max-height: calc(var(--field-font-size) * 1.5 * 8 + var(--field-height) - var(--field-font-size) * 1.5);
  padding: calc((var(--field-height) - var(--field-font-size) * 1.5) / 2) var(--field-padding-x);
  line-height: 1.5;
  resize: vertical;
  field-sizing: content;
}
```

```html
<div class="dn-row is-top">
  <div class="dn-field">
    <label class="dn-field-label" for="email">邮箱</label>
    <input class="dn-input" id="email" type="email" placeholder="name@example.com" aria-describedby="email-help">
    <p class="dn-field-help" id="email-help">用于接收登录验证码。</p>
  </div>
  <div class="dn-field">
    <label class="dn-field-label" for="name">昵称</label>
    <input class="dn-input" id="name" value="林" aria-invalid="true" aria-describedby="name-help">
    <p class="dn-field-help is-error" id="name-help">昵称至少需要 2 个字。</p>
  </div>
</div>
```

输入框内部：前置图标、前后缀、清除按钮和快捷键提示，以及多行文本框和字数统计。

```html
<div class="dn-stack">
  <div class="dn-input-group">
    <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg>
    <input type="search" aria-label="搜索全部笔记" placeholder="搜索全部笔记">
    <span class="dn-input-kbd" aria-hidden="true">⌘K</span>
  </div>
  <div class="dn-field">
    <label class="dn-field-label" for="site">网址</label>
    <div class="dn-input-group">
      <span class="dn-input-affix">https://</span>
      <input id="site" value="deernova.app/notes">
      <button class="dn-input-action is-clear" type="button" aria-label="清除"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button>
    </div>
  </div>
  <div class="dn-field">
    <label class="dn-field-label" for="budget">预算</label>
    <div class="dn-input-group">
      <span class="dn-input-affix">¥</span>
      <input id="budget" class="is-number" inputmode="decimal" value="1,280.00">
      <span class="dn-input-affix">/ 月</span>
    </div>
  </div>
  <div class="dn-field">
    <label class="dn-field-label" for="bio">简介</label>
    <textarea class="dn-input" id="bio" placeholder="一句话介绍你自己" aria-describedby="bio-help bio-count"></textarea>
    <div class="dn-field-foot">
      <p class="dn-field-help" id="bio-help">会显示在共享页面上。</p>
      <span class="dn-field-count" id="bio-count">0 / 120</span>
    </div>
  </div>
</div>
```

## SwiftUI

```swift
VStack(alignment: .leading, spacing: Deernova.space1) {
    Text("邮箱").font(.deernovaCallout.weight(.medium)).foregroundStyle(.inkSecondary)
    TextField("name@example.com", text: $email)
        .textFieldStyle(.roundedBorder)          // Mac；iOS 用自定义样式实现上面的规格
        .textContentType(.emailAddress)
        .keyboardType(.emailAddress)             // iOS
    Text(error ?? "用于接收登录验证码。")
        .font(.caption)
        .foregroundStyle(error == nil ? .inkTertiary : .danger)
}
```

iOS 设置页这类表单，直接在 `Form` 里用 `TextField`，交给系统的分组样式，见 [分组列表](list.md)。

## 不要

- 只用占位符代替标签；把格式、长度这类要求只写在占位符里；占位符写「请输入……」。
- 用上下内边距撑高输入框；让清除按钮出现时把文字挤动；数字左对齐导致小数点对不齐。
- 出错时只把边框变红、不给说明。
- 给激活态套黑色或灰色外框，或用零模糊的 box-shadow 冒充阴影；全局 outline、ring 不得叠到输入框上。
- 把多行输入塞进单行框（多行用 `textarea`、`TextField(axis: .vertical)` 或 [Composer](composer.md)）。
