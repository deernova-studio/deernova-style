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
<!-- /tokens -->

- 底色 `surface-raised`，边框 `stroke-control` 宽、`line-control` 色，保证 3:1。
- 聚焦时边框变 `focus-ring`，外圈加 3px 的 `accent-soft` 光晕。
- 出错时边框变 `danger`，说明文字换成错误信息，同样用 `danger` 色。错误信息要说清楚怎么改。
- 标签在输入框上方，`callout` 字号、中粗、`ink-secondary`；说明在下方，`caption` 字号、常规字重、`ink-tertiary`。标签、输入框、说明之间 `space-1`。
- 触控端输入文字不小于 16px，避免浏览器在聚焦时放大页面（`field-font-size` 已经保证）。
- 下拉选择（`select`）和输入框同高、同边框。

## Web

```css
.dn-field { display: grid; gap: var(--space-1); min-width: 0; }
.dn-field-label { color: var(--ink-secondary); font: var(--weight-medium) var(--type-callout-size)/var(--type-callout-line) var(--font-sans); }
.dn-input {
  box-sizing: border-box;
  width: 100%;
  height: var(--field-height);
  padding: 0 var(--field-padding-x);
  border: var(--stroke-control) var(--line-style-divider) var(--line-control);
  border-radius: var(--field-radius);
  background: var(--surface-raised);
  color: var(--ink);
  font: var(--weight-regular) var(--field-font-size)/1.2 var(--font-sans);
  transition: border-color var(--duration-instant) var(--ease-standard), box-shadow var(--duration-instant) var(--ease-standard);
}
.dn-input::placeholder { color: var(--ink-tertiary); }
.dn-input:focus { outline: none; border-color: var(--focus-ring); box-shadow: 0 0 0 3px var(--accent-soft); }
.dn-input[aria-invalid="true"] { border-color: var(--danger); }
.dn-input:disabled { opacity: var(--opacity-disabled); }
.dn-field-help { color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); }
.dn-field-help.is-error { color: var(--danger); }
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

- 只用占位符代替标签。
- 出错时只把边框变红、不给说明。
- 把多行输入塞进单行框（多行用 `textarea`、`TextField(axis: .vertical)` 或 [Composer](composer.md)）。
