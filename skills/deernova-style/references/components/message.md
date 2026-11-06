# 消息

对话里的一条消息。用户说的话放在比内容区亮一层的气泡里，靠右；AI 的回答直接排在内容区上，用和界面一样的无衬线正文，靠左。执行过程见 [工具调用与执行步骤](step-row.md)，任务进度见 [任务清单](task-list.md)。

**需要提供**：发送者（用户或 AI）、内容（Markdown，可以包含代码块、列表、链接）、AI 消息的操作（复制、重新生成），以及生成中的状态。

## 尺寸

<!-- tokens:message -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `message-font-size` | 15 | 15 | 15 | 用户消息气泡的字号。AI 回答用 type-body，和界面正文一致。 |
| `message-action-size` | 24 | 32 | 28 | AI 消息下方操作按钮的可见尺寸。 |
<!-- /tokens -->

- 用户消息：靠右，最大宽度 80%，`surface-raised` 底，`radius-lg`，内边距上下 `space-3`、左右 `space-4`，字号 `message-font-size`、行高同 `type-body`。
- AI 消息：靠左，不加气泡，正文用 `type-body`（桌面 15/24），栏宽不超过 `content-max`。段落之间 `space-3`；加粗用 600；列表缩进一级、项与项之间 4。代码见[代码块](code-block.md)，行内代码用等宽字加 `fill-selected` 底。
- 消息、工具调用行、卡片之间统一 `space-4`。
- 操作按钮放在 AI 消息下方，`message-action-size` 的图标按钮，`ink-tertiary` 色；指针端只在悬停时显示，触控端一直显示。
- 链接用 `ink` 色，加 1px 的 `line-control` 色下划线，下偏移 3px。
- 操作按钮悬停才出现时，键盘聚焦和触屏上仍然可见，规则见 [悬停才出现的操作](tooltip.md#悬停才出现的操作)。
- 生成中：回答末尾显示「正在运行」状态（见 [工具调用与执行步骤](step-row.md)），Composer 的发送按钮变成「停止」。

## Web

```css
.dn-thread { display: flex; flex-direction: column; gap: var(--space-4); max-width: var(--content-max); }
.dn-message-user {
  align-self: flex-end;
  max-width: 80%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--surface-raised);
  color: var(--ink);
  font: var(--weight-regular) var(--message-font-size)/var(--type-body-line) var(--font-sans);
}
.dn-message-assistant { color: var(--ink); font: var(--type-body); }
.dn-message-assistant p { margin: 0 0 var(--space-3); }
.dn-message-assistant p:last-of-type { margin-bottom: 0; }
.dn-message-assistant ul, .dn-message-assistant ol { margin: 0 0 var(--space-3); padding-left: 1.4em; }
.dn-message-assistant li + li { margin-top: var(--space-1); }
.dn-message-assistant strong { font-weight: var(--weight-semibold); }
.dn-message-assistant code { padding: 1px 5px; border-radius: var(--radius-xs); background: var(--fill-selected); font: 0.9em/1 var(--font-mono); }
.dn-message-assistant a { color: var(--ink); text-decoration: underline 1px var(--line-control); text-underline-offset: 3px; }
.dn-message-actions { display: flex; gap: 2px; margin: var(--space-2) 0 0 calc(var(--space-1) * -1); }
.dn-message-actions .dn-icon-button { width: var(--message-action-size); height: var(--message-action-size); color: var(--ink-tertiary); }
.dn-message-actions .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
@media (hover: hover) and (pointer: fine) {
  .dn-message-actions { opacity: 0; transition: opacity var(--duration-instant) var(--ease-standard); }
  .dn-message-assistant:hover .dn-message-actions, .dn-message-actions:focus-within { opacity: 1; }
}
```

```html
<div class="dn-thread">
  <div class="dn-message-user">帮我把这份周报整理成三条要点</div>
  <div class="dn-message-assistant">
    <p>这周的进展可以归成三件事：</p>
    <ul>
      <li><strong>首页改版定稿。</strong>信息层级按「最近、收藏、全部」排列，下周三前交给开发。</li>
      <li><strong>同步问题修复。</strong>离线编辑后重复保存的问题已经解决。</li>
      <li><strong>订阅转化提升。</strong>年付转化率从 3.1% 升到 4.4%。</li>
    </ul>
    <p>需要的话，我可以按 <a href="#">周报模板</a> 再排一次，或者导出成 <code>weekly.md</code>。</p>
    <div class="dn-message-actions">
      <button class="dn-icon-button" type="button" aria-label="复制"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></button>
      <button class="dn-icon-button" type="button" aria-label="重新生成"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></svg></button>
    </div>
  </div>
</div>
```

## SwiftUI

```swift
// 用户消息
Text(message.text)
    .font(.system(size: Deernova.messageFontSize))
    .padding(.vertical, Deernova.space3).padding(.horizontal, Deernova.space4)
    .background(.surfaceRaised, in: .rect(cornerRadius: Deernova.radiusLg))
    .frame(maxWidth: .infinity, alignment: .trailing)

// AI 消息：用 AttributedString(markdown:) 渲染，或接入 Markdown 渲染库
Text(try AttributedString(markdown: message.text))
    .font(.deernovaBody)
    .lineSpacing(6)
    .textSelection(.enabled)
    .frame(maxWidth: Deernova.contentMax, alignment: .leading)
```

## 不要

- 给 AI 回答加气泡，或者用衬线排 AI 回答。
- 用头像区分谁在说话（靠位置就够了）。
- 在正文里用彩色强调文字（强调用加粗）。
