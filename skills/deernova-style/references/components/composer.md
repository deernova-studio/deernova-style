# Composer 输入区

发消息、写笔记、向 AI 提问的输入区，放在对话栏底部。它承载的是用户正在写的内容，所以是纸面，不是玻璃。

由上到下三部分：可选的**提示条**（贴在输入框正上方）、**输入框**（加号、输入、语音、发送排在同一行）、**信息行**（模型、思考强度、权限模式、上下文用量，靠右）。

**需要提供**：绑定的文本、占位符、发送动作、是否可以发送（内容为空或正在生成时禁用）。可选：附件列表、提示条、模型和权限的选择、上下文用量。

## 尺寸

<!-- tokens:composer -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `composer-radius` | 14 | 24 | 16 | Composer 外框圆角。 |
| `composer-min-height` | 44 | 44 | 48 | 单行时的高度：加号、输入、发送排在同一行，输入多行时向上长高。 |
<!-- /tokens -->

- 输入框：`surface-raised` 底、1px `line` 描边、`composer-radius`、`shadow-float`。单行时高 `composer-min-height`（桌面 44），加号、输入、发送垂直居中在同一行；输入多行时向上长高，最多 8 行，超出后内部滚动。获得焦点时描边加深为 `line-control`。
- 文字用 `type-body`；占位符写清快捷键，例如「按 ⏎ 发送，按 ⌘⏎ 加入队列稍后发送」。
- 加号和语音是[图标按钮](button.md)。发送按钮是 `button-height-md` 的圆形，`accent` 底、`on-accent` 箭头；不能发送时 `fill-selected` 底、`ink-tertiary` 箭头，不隐藏；正在生成时变成停止方块。
- 附件：在输入框内、文字上方单独一行，`surface-sunken` 底、`radius-sm` 的文件条。
- 提示条：宽度和输入框一致，`surface-raised` 底、`banner-radius`，单行高 `composer-min-height`，左边图标和一句话，右边关闭按钮；次要信息用 `ink-secondary`。和输入框之间 `space-2`。
- 信息行：输入框下方 `space-2`，靠右排列，`callout` 字号；当前值用 `ink`，说明用 `ink-secondary`；每一项都是可以点开选择的文字按钮。
- 指针端 Return 发送、Shift-Return 换行；触控端换行键就是换行，只能点按钮发送。

## Web

```css
.dn-composer-stack { display: grid; gap: var(--space-2); width: 100%; max-width: var(--content-max); }
.dn-composer-notice {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--composer-min-height);
  padding: 0 var(--space-1) 0 var(--space-3);
  border-radius: var(--banner-radius);
  background: var(--surface-raised);
  color: var(--ink);
  font: var(--type-callout);
}
.dn-composer-notice > .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); color: var(--ink-secondary); }
.dn-composer-notice .dn-muted { color: var(--ink-secondary); }
.dn-composer-notice .dn-icon-button { margin-left: auto; }
.dn-composer {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-1);
  min-height: var(--composer-min-height);
  padding: calc((var(--composer-min-height) - var(--button-height-md)) / 2 - var(--stroke-line)) var(--space-2);
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--composer-radius);
  background: var(--surface-raised);
  box-shadow: var(--shadow-float);
  transition: border-color var(--duration-instant) var(--ease-standard);
}
.dn-composer:focus-within { border-color: var(--line-control); }
.dn-composer textarea {
  flex: 1;
  min-width: 0;
  min-height: var(--button-height-md);
  max-height: calc(var(--type-body-line) * 8 + 4px);
  padding: calc((var(--button-height-md) - var(--type-body-line)) / 2) var(--space-1);
  border: 0;
  outline: none;
  resize: none;
  field-sizing: content;
  background: transparent;
  color: var(--ink);
  font: var(--type-body);
}
.dn-composer textarea::placeholder { color: var(--ink-tertiary); }
.dn-composer-attachments { display: flex; flex-wrap: wrap; flex-basis: 100%; gap: var(--space-1); padding: 0 0 var(--space-1); }
.dn-attachment {
  display: inline-flex;
  align-items: center;
  gap: var(--gap-inline);
  height: var(--button-height-sm);
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--surface-sunken);
  color: var(--ink-secondary);
  font: var(--weight-regular) var(--type-callout-size)/1 var(--font-sans);
}
.dn-attachment .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
.dn-send {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  width: var(--button-height-md);
  height: var(--button-height-md);
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--accent);
  color: var(--on-accent);
  cursor: pointer;
}
.dn-send .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); stroke-width: 2.2; }
.dn-send:disabled { background: var(--fill-selected); color: var(--ink-tertiary); cursor: default; }
.dn-send:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset); }
.dn-send::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, var(--hit-min));
  height: max(100%, var(--hit-min));
  transform: translate(-50%, -50%);
}
.dn-composer-meta { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 2px; }
.dn-meta-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--gap-inline);
  height: var(--button-height-sm);
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--button-radius-sm);
  background: transparent;
  color: var(--ink-secondary);
  font: var(--weight-regular) var(--type-callout-size)/1 var(--font-sans);
  cursor: pointer;
}
@media (hover: hover) { .dn-meta-button:hover { background: var(--fill-hover); } }
.dn-meta-button:active { background: var(--fill-selected); }
.dn-meta-button b { color: var(--ink); font-weight: var(--weight-regular); }
.dn-context-ring {
  width: var(--icon-size-sm);
  height: var(--icon-size-sm);
  border-radius: var(--radius-full);
  background: conic-gradient(var(--ink-secondary) calc(var(--used, 0.3) * 1turn), var(--fill-selected) 0);
  -webkit-mask: radial-gradient(circle, transparent 55%, #000 57%);
  mask: radial-gradient(circle, transparent 55%, #000 57%);
}
```

```html
<div class="dn-composer-stack">
  <div class="dn-composer-notice" role="status">
    <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    <span>本周额度将提前用完 <span class="dn-muted">已使用 52% · 11 月 9 日重置</span></span>
    <button class="dn-icon-button" type="button" aria-label="关闭提示"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>
  <div class="dn-composer">
    <div class="dn-composer-attachments"><span class="dn-attachment"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>周报草稿.md</span></div>
    <button class="dn-icon-button" type="button" aria-label="添加附件"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
    <textarea rows="1" aria-label="消息" placeholder="按 ⏎ 发送，按 ⌘⏎ 加入队列稍后发送"></textarea>
    <button class="dn-icon-button" type="button" aria-label="语音输入"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>
    <button class="dn-send" type="button" aria-label="发送" disabled><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
  </div>
  <div class="dn-composer-meta">
    <button class="dn-meta-button" type="button"><b>Opus 5.5</b>高</button>
    <button class="dn-meta-button" type="button"><b>询问权限</b></button>
    <span class="dn-context-ring" role="img" aria-label="上下文已用 30%"></span>
  </div>
</div>
```

## SwiftUI

```swift
VStack(alignment: .trailing, spacing: Deernova.space2) {
    HStack(alignment: .bottom, spacing: Deernova.space1) {
        Button("添加附件", systemImage: "plus") { attach() }
            .labelStyle(.iconOnly).buttonStyle(.borderless)
        TextField("按 ⏎ 发送，按 ⌘⏎ 加入队列稍后发送", text: $draft, axis: .vertical)
            .lineLimit(1...8)
            .textFieldStyle(.plain)
            .font(.deernovaBody)
            .onSubmit(send)                                   // Mac：Return 发送
        Button("语音输入", systemImage: "mic") { dictate() }
            .labelStyle(.iconOnly).buttonStyle(.borderless)
        Button(action: send) {
            Image(systemName: "arrow.up").fontWeight(.semibold)
                .frame(width: Deernova.buttonHeightMd, height: Deernova.buttonHeightMd)
        }
        .buttonStyle(.borderedProminent)
        .buttonBorderShape(.circle)
        .disabled(draft.isEmpty)
    }
    .padding(.horizontal, Deernova.space2)
    .frame(minHeight: Deernova.composerMinHeight)
    .background(.surfaceRaised, in: .rect(cornerRadius: Deernova.composerRadius))
    .overlay(RoundedRectangle(cornerRadius: Deernova.composerRadius).strokeBorder(.line, lineWidth: Deernova.strokeLine))
    .shadow(color: .black.opacity(0.08), radius: 10, y: 6)

    HStack(spacing: Deernova.space2) {            // 信息行：模型、权限
        Menu("Opus 5.5 · 高") { … }
        Menu("询问权限") { … }
    }
    .font(.deernovaCallout)
    .menuStyle(.borderlessButton)
    .foregroundStyle(.inkSecondary)
}
```

放在页面底部时用 `.safeAreaInset(edge: .bottom)`，让内容可以滚到它的上方。

## 不要

- 把 Composer 做成玻璃（它承载的是内容）。
- 把模型、权限这类设置塞进输入框里；把发送按钮放到框外。
- 禁用时把按钮直接隐藏，让布局跳动。
- 提示条和输入框宽度不一致，或者离得很远。
