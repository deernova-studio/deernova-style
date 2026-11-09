# 消息

对话里的一条消息。用户说的话放在比内容区亮一层的气泡里，靠右；AI 的回答直接排在内容区上，用和界面一样的无衬线正文，靠左。执行过程见 [工具调用与执行步骤](step-row.md)，任务进度见 [任务清单](task-list.md)。

**需要提供**：发送者（用户或 AI）、内容（Markdown，可以包含代码块、列表、链接、引用角标）、AI 消息的操作（复制、重新生成、反馈），生成中、已停止、失败的状态，以及有多个版本时的分支信息。一轮回答里各个块的顺序见 [AI 交互](../foundations/ai.md)。

## 尺寸

<!-- tokens:message -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `message-font-size` | 15 | 15 | 15 | 用户消息气泡的字号。AI 回答用 type-body，和界面正文一致。 |
| `message-action-size` | 24 | 32 | 28 | AI 消息下方操作按钮的可见尺寸。 |
| `cite-height` | 16 | 18 | 18 | 正文里引用角标的高度。 |
<!-- /tokens -->

- 用户消息：靠右，最大宽度 80%，`surface-raised` 底，`radius-lg`，内边距上下 `space-3`、左右 `space-4`，字号 `message-font-size`、行高同 `type-body`。
- AI 消息：靠左，不加气泡，正文用 `type-body`（桌面 15/24），栏宽不超过 `content-max`。段落之间 `space-3`；加粗用 600；列表缩进一级、项与项之间 4。代码见[代码块](code-block.md)，行内代码用等宽字加 `fill-selected` 底。
- 消息、工具调用行、卡片之间统一 `space-4`。
- 操作按钮放在 AI 消息下方，`message-action-size` 的图标按钮，`ink-tertiary` 色；指针端只在悬停时显示，触控端一直显示。
- 链接用 `ink` 色，加 1px 的 `line-control` 色下划线，下偏移 3px。
- 操作按钮悬停才出现时，键盘聚焦和触屏上仍然可见，规则见 [悬停才出现的操作](tooltip.md#悬停才出现的操作)。
- 生成中：回答末尾显示「正在运行」状态（见 [思考、工具调用与执行步骤](step-row.md)），Composer 的发送按钮变成「停止」。

## 流式输出和滚动

- 正文边生成边出现，不加闪烁的光标；已经出现的文字位置不再变化。代码块一开始就按代码块排版，表格和图片先留出位置，避免整段跳动。
- 正文开始出现后，运行状态行消失；回答结束后，操作行淡入。
- **跟随滚动**：用户停在对话底部（离底部 48px 以内）时，新内容出现就跟着滚到底；用户往上翻，就停止跟随，不把他拉回去。
- **回到底部**：停止跟随后，在 Composer 正上方居中出现一个 `button-height-md` 的圆形按钮（`surface-raised` 底、`shadow-float`、向下箭头）；有待确认的事项或新回答时，按钮变成带文字的胶囊（「1 项等待确认」「新回答」）。点一下平滑滚到底，减弱动态效果时直接跳过去。

## 引用和来源

- 引用了网页或文件的句子，句末放一个编号角标：高 `cite-height`，`caption` 字号、等宽数字，`fill-selected` 底、`radius-xs`，和正文基线对齐。
- 悬停或聚焦角标，出现[悬停卡片](tooltip.md)：来源标题、域名或文件路径、一两行摘录；点击打开来源。
- 回答末尾、操作行上方放一行来源：「来源」加编号列表，每项是图标、标题和域名（`ink-secondary`），超过 3 条时折叠成「还有 5 个来源」。不用网站的彩色图标，统一用地球或文件图标。

## 操作和分支

- AI 消息下方的操作行依次是：分支切换（有多个版本时）、复制、重新生成、赞、踩、更多（分享、朗读）。按钮是 `message-action-size` 的图标按钮，`ink-tertiary`；指针端悬停才出现，最后一条回答始终显示。
- **分支切换**：「‹ 2 / 3 ›」，`caption` 等宽数字，两侧是小箭头按钮；重新生成或编辑用户消息都会产生新的分支，旧的版本不删除。
- **编辑用户消息**：悬停用户气泡，在它左下方出现编辑按钮；点了之后气泡原地变成输入框，下面是「取消」和「发送」，发送后从这一条开始生成新的分支。
- **反馈**：点赞或点踩后按钮保持选中（`ink` 色）；点踩后可以在小浮层里选原因（不准确、没有回答问题、太长），也可以直接关掉，不强迫填写。提交后用轻提示「已收到反馈」。
- 复制后按钮图标短暂变成对勾，不弹轻提示。

## 停止、失败和排队

- **已停止**：保留已经生成的内容，末尾一行 `caption`、`ink-tertiary` 的「已停止」；操作行多一个「继续生成」。
- **失败**：在回答原位显示一行：`danger` 的图标、原因（`ink`，写清楚怎么回事和已保留的内容）、「重试」小按钮。不弹窗，不清空已经生成的部分。
- **排队**：运行中发出的消息排在 Composer 正上方，每条一行：`ink-secondary` 的文字、「排队中」、删除按钮；轮到它时才进入对话。

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
.dn-message-actions { display: flex; align-items: center; gap: 2px; margin: var(--space-2) 0 0 calc(var(--space-1) * -1); }
.dn-message-actions .dn-icon-button { width: var(--message-action-size); height: var(--message-action-size); color: var(--ink-tertiary); }
.dn-message-actions .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
@media (hover: hover) and (pointer: fine) {
  .dn-message-actions { opacity: 0; transition: opacity var(--duration-instant) var(--ease-standard); }
  .dn-message-assistant:hover .dn-message-actions, .dn-message-actions:focus-within, .dn-message-assistant.is-latest .dn-message-actions { opacity: 1; }
}
.dn-message-actions .dn-icon-button[aria-pressed="true"] { color: var(--ink); }
.dn-branch { display: inline-flex; align-items: center; gap: 2px; margin-right: var(--space-1); color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); font-variant-numeric: tabular-nums; }
.dn-cite { display: inline-grid; place-items: center; min-width: var(--cite-height); height: var(--cite-height); margin: 0 1px; padding: 0 3px; border-radius: var(--radius-xs); background: var(--fill-selected); color: var(--ink-secondary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); font-variant-numeric: tabular-nums; text-decoration: none; vertical-align: 0.1em; }
@media (hover: hover) { .dn-cite:hover { color: var(--ink); background-image: linear-gradient(var(--fill-hover), var(--fill-hover)); } }
.dn-sources { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-1) var(--space-3); margin: var(--space-3) 0 0; padding: 0; list-style: none; color: var(--ink-secondary); font: var(--type-callout); }
.dn-sources > li { display: inline-flex; align-items: center; gap: var(--gap-inline); min-width: 0; }
.dn-sources .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
.dn-sources-label { color: var(--ink-tertiary); }
.dn-message-stopped { margin: var(--space-2) 0 0; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); }
.dn-message-error { display: flex; align-items: center; gap: var(--space-2); margin: var(--space-3) 0 0; color: var(--ink); font: var(--type-callout); }
.dn-message-error > .dn-icon { flex: none; width: var(--icon-size-md); height: var(--icon-size-md); color: var(--danger); }
.dn-jump { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: var(--gap-inline); min-width: var(--button-height-md); height: var(--button-height-md); padding: 0 var(--space-2); border: 0; border-radius: var(--radius-full); background: var(--surface-raised); color: var(--ink); box-shadow: var(--shadow-float); font: var(--weight-regular) var(--type-callout-size)/1 var(--font-sans); cursor: pointer; }
.dn-jump .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
.dn-jump[aria-label] { width: var(--button-height-md); padding: 0; }
```

```html
<div class="dn-thread">
  <div class="dn-message-user">帮我把这份周报整理成三条要点</div>
  <div class="dn-message-assistant">
    <p>这周的进展可以归成三件事：</p>
    <ul>
      <li><strong>首页改版定稿。</strong>信息层级按「最近、收藏、全部」排列，下周三前交给开发。</li>
      <li><strong>同步问题修复。</strong>离线编辑后重复保存的问题已经解决。</li>
      <li><strong>订阅转化提升。</strong>年付转化率从 3.1% 升到 4.4%<a class="dn-cite" href="#" aria-label="来源 1">1</a>。</li>
    </ul>
    <p>需要的话，我可以按 <a href="#">周报模板</a> 再排一次，或者导出成 <code>weekly.md</code>。</p>
    <ul class="dn-sources" aria-label="来源"><li class="dn-sources-label">来源</li><li><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>1 · 订阅数据周报.xlsx</li><li><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>2 · 定价实验说明 · notion.so</li></ul>
    <div class="dn-message-actions">
      <span class="dn-branch"><button class="dn-icon-button" type="button" aria-label="上一个版本"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>2 / 3<button class="dn-icon-button" type="button" aria-label="下一个版本"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></span>
      <button class="dn-icon-button" type="button" aria-label="复制"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></button>
      <button class="dn-icon-button" type="button" aria-label="重新生成"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></svg></button>
      <button class="dn-icon-button" type="button" aria-label="有帮助" aria-pressed="true"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 3 2l-1 4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7"/></svg></button>
      <button class="dn-icon-button" type="button" aria-label="没帮助" aria-pressed="false"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 13V4H4v9zM7 13l4 7a2 2 0 0 0 3-2l-1-4h5a2 2 0 0 0 2-2.3l-1.2-6A2 2 0 0 0 16.8 4H7"/></svg></button>
    </div>
  </div>
</div>
```

已停止、失败，以及停止跟随滚动后出现的「回到底部」：

```html
<div class="dn-thread">
  <div class="dn-message-assistant">
    <p>可以从三个方向压缩首屏的加载时间：先把图集拆小，再延迟加载</p>
    <p class="dn-message-stopped">已停止</p>
  </div>
  <div class="dn-message-assistant">
    <p>正在整理第二部分的数据。</p>
    <div class="dn-message-error" role="alert"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>网络中断，已生成的内容已保留。<button class="dn-button is-sm" type="button">重试</button></div>
  </div>
  <div class="dn-row">
    <button class="dn-jump" type="button" aria-label="回到底部"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg></button>
    <button class="dn-jump" type="button"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>1 项等待确认</button>
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
- 生成时用户往上翻，还强行把他拉回底部；失败时清空已经生成的内容，或者弹窗报错。
- 重新生成时覆盖旧的回答，不留分支；引用只写在末尾，正文里看不出哪句话来自哪里。
