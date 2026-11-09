# Composer 输入区（AI 输入框）

发消息、写笔记、向 AI 提问的输入区，放在对话栏底部。它承载的是用户正在写的内容，所以是纸面，不是玻璃。

由上到下三部分：可选的**提示条**（贴在输入框正上方）、**输入框**（附件、文字、添加、工具、语音、发送）、**信息行**（在输入框右下方：模型、思考强度、权限模式、上下文用量）。

**需要提供**：绑定的文本、占位符、发送动作、是否可以发送（内容为空或正在生成时禁用）。可选：附件列表、提示条、模型和权限的选择、上下文用量。

## 尺寸

<!-- tokens:composer -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `composer-radius` | 14 | 24 | 16 | Composer 外框圆角。 |
| `composer-min-height` | 44 | 44 | 48 | 单行布局的高度：加号、输入、发送排在同一行，输入多行时向上长高。 |
| `composer-thumb-size` | 48 | 56 | 56 | 图片附件缩略图的边长。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `composer-attachment-max-width` | `240px` | 文件附件条的最大宽度，文件名放不下时中间省略。 |
<!-- /tokens -->

## 两种布局

输入框里只放「写」和「发」：添加、工具、文字、语音、发送。模型、思考强度、权限这些设置统一放在框外右下方的信息行，两种布局都一样，输入框本身保持简洁。

两种布局用同一套零件和尺寸：输入框里所有按钮和工具标签都是 `button-height-md` 高，发送是同样大小的圆形，永远在最右边。

| 布局 | 用在哪里 | 排列 |
| --- | --- | --- |
| 单行（默认） | 对话进行中，放在对话栏底部 | 一行：添加、文字、语音、发送 |
| 双行 | 新对话、首页的大输入框，或者需要常驻工具的场景 | 上面是附件和文字，占满宽度；下面是工具行：左边添加、工具、已开启的工具标签，右边语音、发送 |

- 顺序固定：左边是「往里加东西」（添加、工具），右边是「发出去」（语音、发送）；右下方是设置（模型、思考强度、权限、上下文用量）。同一个应用里不要换位置。
- 双行布局里，文字的左边缘和下方第一个图标的左边缘对齐；文字区最少 2 行高。
- 窄于 `breakpoint-sm` 时用单行布局；信息行只留模型和上下文用量，其余收进模型菜单。

## 外框

- `surface-raised` 底、无描边、`composer-radius`、`shadow-float`。双行布局四周内边距 `space-2`；单行布局高 `composer-min-height`（桌面 44），所有按钮垂直居中在同一行。输入多行时向上长高，最多 8 行，超出后内部滚动。
- 输入时沿用原有柔影，不添加边框、外圈或额外阴影；焦点在内部按钮上时，只提示对应按钮。
- 宽度和对话栏一致，不超过 `content-max`；固定在内容区底部时让出安全区（`env(safe-area-inset-bottom)`）。

## 文字和占位符

- 文字用 `type-body`，左对齐；第一行和两侧的按钮按中线对齐：行高等于 `type-body-line`，上下内边距 =（`button-height-md` − 行高）÷ 2。
- 占位符说清现在能做什么，或者给出快捷键：单行「按 ⏎ 发送，按 ⌘⏎ 加入队列稍后发送」，双行「描述你要做的事，可以拖入文件」。一行，`ink-tertiary`，不加句号；放不下时截断，不折行。窄屏换成短的「发消息」。

## 附件

- 放在输入框里、文字上方，单独一行，从左往右排，间距 `space-1`；放不下时这一行横向滚动（隐藏滚动条），不把输入框撑高。
- **文件**：`button-height-sm` 高的文件条，`surface-sunken` 底、`radius-sm`。依次是类型图标（`icon-size-sm`、`ink-secondary`）、文件名（`ink`，放不下时省略，扩展名单独显示，不被省略掉）、大小或页数（`ink-tertiary`）、移除按钮。最宽 `composer-attachment-max-width`。
- **图片**：`composer-thumb-size` 的方形缩略图，`radius-sm`，内侧一圈 1px `line`，让白底图片也有边界；移除按钮浮在右上角，指针端悬停或聚焦时出现，触屏上一直显示。
- **上传中**：图标换成进度环，说明换成「上传中 42%」；有附件在上传时，发送按钮不可用。
- **失败**：`danger-soft` 底，图标和说明用 `danger`（「上传失败」），末尾的按钮换成重试；失败的附件不会随消息发出。
- 超出数量或大小限制时，用输入框上方的提示条说明，不弹窗。

## 添加、工具和模型

- **添加**（加号）：[图标按钮](button.md)。只有一种来源时直接打开文件选择；有多种来源时打开[菜单](menu.md)：上传文件、添加图片、截图、连接的应用。
- **工具**（滑块图标）：打开菜单，里面是可以开关的能力（联网搜索、深度思考、代码执行），用 `menuitemcheckbox` 和对勾。
- **已开启的工具**：双行布局在工具行里、「工具」按钮后面显示成工具标签；单行布局显示在信息行的最左边：`button-height-md` 高、`fill-selected` 底、`ink` 字，`icon-size-sm` 图标加名称；点一下就关闭（`aria-pressed="true"`）。最多显示 3 个，其余收成「+2」。
- **模型**：文字按钮，模型名加一个向下的小箭头，`ink-secondary`，悬停变 `ink` 并出现 `fill-hover`。点开是菜单，每个模型一行（名称加右侧一句说明），当前模型打对勾；思考强度放在同一个菜单的分组里。放在信息行，也就是输入框右下方，两种布局都一样。

## 发送、停止和语音

- 发送按钮是 `button-height-md` 的圆形，`accent` 底、`on-accent` 箭头。
- 状态：没有内容，或者附件还在上传时，`fill-selected` 底、`ink-tertiary` 箭头，不隐藏；有内容时可用；正在生成时变成停止（实心方块），`aria-label` 改成「停止生成」。按钮的大小和位置在所有状态下都不变。
- 语音是发送左边的图标按钮。录音时文字区换成一行录音状态：`danger` 色的圆点、「录音中」和计时（等宽数字）；右边是取消（×）和完成（对勾，占发送按钮的位置）。完成后转成文字放进输入框，不直接发送。

## 键盘和输入法

- 在文字里输入 `@`、`/`、`#` 弹出建议浮层，选中后变成行内标签，见[提及与命令](mention.md)。
- 指针端 Return 发送、Shift-Return 换行；正在生成时 ⌘-Return 把这条消息加入队列；焦点在输入框里时，Esc 停止生成。触控端换行键就是换行，只能点按钮发送。
- **输入法**：中文、日文输入法选词时按 Return 只确认候选词，不能发送。监听按键时检查 `event.isComposing`（或 `keyCode === 229`）。
- 发送后焦点留在输入框里，清空文字和附件；发送失败时把内容还给输入框，不让用户重打。

## 拖放和粘贴

- 文件拖到窗口上时，整个输入框进入放置状态：底色上叠一层 `fill-selected`，占位符换成「松开以添加文件」；拖走或放下后恢复。
- 粘贴图片直接变成图片附件；粘贴很长的文本（例如超过 2000 字）时，变成一个「粘贴的文本」文件条，不把输入框撑满。

## 提示条和信息行

- 提示条：宽度和输入框一致，`surface-raised` 底、`banner-radius`，单行高 `composer-min-height`，左边图标和一句话，右边关闭按钮；次要信息用 `ink-secondary`。和输入框之间 `space-2`。
- 信息行：在输入框下方 `space-2`，靠右排列，右边缘和输入框对齐，`callout` 字号。从左到右是模型（含思考强度）、权限模式、上下文用量；当前值用 `ink`，说明用 `ink-secondary`；每一项都是可以点开选择的文字按钮，悬停出现 `fill-hover`。上下文用量用一个小圆环，悬停时显示具体数字。没有权限设置的应用就只放模型和上下文用量。

## 无障碍

- 文字区有 `aria-label`（「消息」）；所有图标按钮都有名称；添加、工具、模型按钮加 `aria-haspopup="menu"`；工具标签用 `aria-pressed`。
- 附件行用 `role="list"`；每个附件的移除按钮名称带上文件名（「移除 周报草稿.md」）；上传进度和失败用 `aria-live="polite"` 读出来。

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
  min-width: 0;
  min-height: var(--composer-min-height);
  padding: calc((var(--composer-min-height) - var(--button-height-md)) / 2) var(--space-2);
  border: 0;
  border-radius: var(--composer-radius);
  background: var(--surface-raised);
  box-shadow: var(--shadow-float);
}
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
.dn-composer textarea:focus { outline: none; box-shadow: none; }
.dn-composer-attachments { display: flex; align-items: center; flex-basis: 100%; gap: var(--space-1); padding: 0 0 var(--space-1); overflow-x: auto; scrollbar-width: none; }
.dn-composer-attachments::-webkit-scrollbar { display: none; }
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
.dn-attachment { flex: none; max-width: var(--composer-attachment-max-width); padding-inline-end: 2px; }
.dn-attachment > .dn-icon, .dn-attachment > .dn-context-ring { flex: none; width: var(--icon-size-sm); height: var(--icon-size-sm); }
.dn-attachment-name { min-width: 0; overflow: hidden; color: var(--ink); text-overflow: ellipsis; white-space: nowrap; }
.dn-attachment-ext { flex: none; margin-inline-start: calc(var(--gap-inline) * -1); color: var(--ink); }
.dn-attachment-meta { flex: none; color: var(--ink-tertiary); white-space: nowrap; }
.dn-attachment.is-error { background: var(--danger-soft); }
.dn-attachment.is-error > .dn-icon, .dn-attachment.is-error .dn-attachment-meta { color: var(--danger); }
.dn-attachment-remove {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  width: var(--icon-size-md);
  height: var(--icon-size-md);
  padding: 0;
  border: 0;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--ink-tertiary);
  cursor: pointer;
}
.dn-attachment-remove::before { content: ""; position: absolute; inset: 50% auto auto 50%; width: max(100%, var(--hit-min)); height: max(100%, var(--hit-min)); transform: translate(-50%, -50%); }
.dn-attachment-remove .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
@media (hover: hover) { .dn-attachment-remove:hover { background: var(--fill-hover); color: var(--ink); } }
.dn-attachment-remove:focus-visible { outline: none; background: var(--fill-selected); color: var(--ink); }
.dn-attachment-thumb { position: relative; display: grid; place-items: center; flex: none; width: var(--composer-thumb-size); height: var(--composer-thumb-size); border-radius: var(--radius-sm); background: var(--surface-sunken); color: var(--ink-tertiary); outline: var(--stroke-line) solid var(--line); outline-offset: calc(var(--stroke-line) * -1); }
.dn-attachment-thumb img { width: 100%; height: 100%; border-radius: inherit; object-fit: cover; }
.dn-attachment-thumb > .dn-icon { width: var(--icon-size-md); height: var(--icon-size-md); }
.dn-attachment-thumb .dn-attachment-remove { position: absolute; top: 2px; right: 2px; border-radius: var(--radius-full); background: var(--surface-raised); box-shadow: var(--shadow-control); }
@media (hover: hover) and (pointer: fine) {
  .dn-attachment-thumb .dn-attachment-remove { opacity: 0; transition: opacity var(--duration-instant) var(--ease-standard); }
  .dn-attachment-thumb:is(:hover, :focus-within) .dn-attachment-remove { opacity: 1; }
}
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
.dn-send.is-stop .dn-icon { fill: currentColor; stroke: none; }
.dn-send:focus-visible { outline: none; opacity: var(--opacity-solid-hover); }
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
.dn-meta-button .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); margin-inline-start: -2px; color: var(--ink-tertiary); }
.dn-meta-button:focus-visible, .dn-meta-button[aria-expanded="true"] { outline: none; background: var(--fill-selected); }
.dn-composer.is-stacked { flex-direction: column; flex-wrap: nowrap; align-items: stretch; gap: var(--space-1); padding: var(--space-2); }
.dn-composer.is-stacked .dn-composer-attachments { flex-basis: auto; }
.dn-composer.is-stacked textarea { flex: none; min-height: calc(var(--type-body-line) * 2 + var(--button-height-md) - var(--type-body-line)); padding-inline: calc((var(--button-height-md) - var(--icon-size-md)) / 2); }
.dn-composer.is-dropping { background-image: linear-gradient(var(--fill-selected), var(--fill-selected)); }
.dn-composer-toolbar { display: flex; align-items: center; gap: var(--space-1); min-width: 0; }
.dn-composer-end { display: flex; align-items: center; gap: var(--space-1); margin-left: auto; }
.dn-tool-chip {
  display: inline-flex;
  align-items: center;
  flex: none;
  gap: var(--gap-inline);
  height: var(--button-height-md);
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--button-radius-sm);
  font: var(--weight-regular) var(--type-callout-size)/1 var(--font-sans);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--duration-instant) var(--ease-standard), color var(--duration-instant) var(--ease-standard);
}
.dn-tool-chip { background: var(--fill-selected); color: var(--ink); }
.dn-tool-chip .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
@media (hover: hover) { .dn-tool-chip:hover { background-image: linear-gradient(var(--fill-hover), var(--fill-hover)); } }
.dn-tool-chip:active, .dn-tool-chip:focus-visible { outline: none; background-image: linear-gradient(var(--fill-selected), var(--fill-selected)); }
.dn-recording { display: flex; flex: 1; align-items: center; gap: var(--space-2); min-width: 0; min-height: var(--button-height-md); padding: 0 var(--space-1); color: var(--ink-secondary); font: var(--type-body); font-variant-numeric: tabular-nums; }
.dn-recording-dot { flex: none; width: var(--space-2); height: var(--space-2); border-radius: var(--radius-full); background: var(--danger); }
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
    <button class="dn-icon-button" type="button" aria-label="关闭提示"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button>
  </div>
  <div class="dn-composer">
    <div class="dn-composer-attachments" role="list" aria-label="附件"><span class="dn-attachment" role="listitem"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg><span class="dn-attachment-name">周报草稿</span><span class="dn-attachment-ext">.md</span><span class="dn-attachment-meta">12 KB</span><button class="dn-attachment-remove" type="button" aria-label="移除 周报草稿.md"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button></span></div>
    <button class="dn-icon-button" type="button" aria-label="添加" aria-haspopup="menu"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
    <textarea rows="1" aria-label="消息" placeholder="按 ⏎ 发送，按 ⌘⏎ 加入队列稍后发送"></textarea>
    <button class="dn-icon-button" type="button" aria-label="语音输入"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>
    <button class="dn-send" type="button" aria-label="发送"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
  </div>
  <div class="dn-composer-meta">
    <button class="dn-meta-button" type="button" aria-haspopup="menu"><b>Opus 5.5</b>高<svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
    <button class="dn-meta-button" type="button" aria-haspopup="menu"><b>询问权限</b><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
    <span class="dn-context-ring" role="img" aria-label="上下文已用 30%"></span>
  </div>
</div>
```

附件的几种样子：图片、文件、上传中、失败。

```html
<div class="dn-composer-stack">
  <div class="dn-composer is-stacked">
    <div class="dn-composer-attachments" role="list" aria-label="附件">
      <span class="dn-attachment-thumb" role="listitem"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M20 16l-5-5-8 8"/></svg><button class="dn-attachment-remove" type="button" aria-label="移除 截图.png"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button></span>
      <span class="dn-attachment" role="listitem"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg><span class="dn-attachment-name">第三季度经营分析报告终稿</span><span class="dn-attachment-ext">.pdf</span><span class="dn-attachment-meta">2.4 MB</span><button class="dn-attachment-remove" type="button" aria-label="移除 第三季度经营分析报告终稿.pdf"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button></span>
      <span class="dn-attachment" role="listitem"><span class="dn-context-ring" aria-hidden="true"></span><span class="dn-attachment-name">会议录音</span><span class="dn-attachment-ext">.m4a</span><span class="dn-attachment-meta" aria-live="polite">上传中 30%</span><button class="dn-attachment-remove" type="button" aria-label="取消上传 会议录音.m4a"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button></span>
      <span class="dn-attachment is-error" role="listitem"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><span class="dn-attachment-name">数据</span><span class="dn-attachment-ext">.xlsx</span><span class="dn-attachment-meta">上传失败</span><button class="dn-attachment-remove" type="button" aria-label="重试上传 数据.xlsx"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4"/></svg></button></span>
    </div>
    <textarea rows="2" aria-label="消息" placeholder="描述你要做的事，可以拖入文件"></textarea>
    <div class="dn-composer-toolbar">
      <button class="dn-icon-button" type="button" aria-label="添加" aria-haspopup="menu"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
      <button class="dn-icon-button" type="button" aria-label="工具" aria-haspopup="menu"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg></button>
      <button class="dn-tool-chip" type="button" aria-pressed="true"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>联网搜索</button>
      <div class="dn-composer-end">
        <button class="dn-icon-button" type="button" aria-label="语音输入"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>
        <button class="dn-send" type="button" aria-label="发送"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
      </div>
    </div>
  </div>
</div>
```

窄屏的单行布局：信息行只留模型和上下文用量。下面是发送按钮的三种状态（不能发送、可以发送、正在生成），以及录音状态：

```html
<div class="dn-composer-stack">
  <div class="dn-composer">
    <button class="dn-icon-button" type="button" aria-label="添加" aria-haspopup="menu"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
    <textarea rows="1" aria-label="消息" placeholder="发消息"></textarea>
    <button class="dn-icon-button" type="button" aria-label="工具" aria-haspopup="menu"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg></button>
    <button class="dn-send" type="button" aria-label="发送" disabled><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
  </div>
  <div class="dn-composer-meta">
    <button class="dn-meta-button" type="button" aria-haspopup="menu"><b>Opus 5.5</b><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
    <span class="dn-context-ring" role="img" aria-label="上下文已用 30%"></span>
  </div>
  <div class="dn-row">
    <button class="dn-send" type="button" aria-label="发送" disabled><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
    <button class="dn-send" type="button" aria-label="发送"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
    <button class="dn-send is-stop" type="button" aria-label="停止生成"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg></button>
  </div>
  <div class="dn-composer">
    <div class="dn-recording" role="status"><span class="dn-recording-dot" aria-hidden="true"></span>录音中 0:12</div>
    <button class="dn-icon-button" type="button" aria-label="取消录音"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button>
    <button class="dn-send" type="button" aria-label="完成录音"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg></button>
  </div>
</div>
```

## SwiftUI

```swift
VStack(alignment: .trailing, spacing: Deernova.space2) {
    HStack(alignment: .bottom, spacing: Deernova.space1) {
        Menu { addMenu } label: { Image(systemName: "plus") }
            .menuStyle(.borderlessButton)
        TextField("按 ⏎ 发送，按 ⌘⏎ 加入队列稍后发送", text: $draft, axis: .vertical)
            .lineLimit(1...8)
            .textFieldStyle(.plain)
            .font(.deernovaBody)
            .onSubmit(send)                                   // Mac：Return 发送
        Button("语音输入", systemImage: "mic") { dictate() }
            .labelStyle(.iconOnly).buttonStyle(.borderless)
        Button(action: isGenerating ? stop : send) {
            Image(systemName: isGenerating ? "stop.fill" : "arrow.up").fontWeight(.semibold)
                .frame(width: Deernova.buttonHeightMd, height: Deernova.buttonHeightMd)
        }
        .buttonStyle(.borderedProminent)
        .buttonBorderShape(.circle)
        .disabled(!isGenerating && draft.isEmpty)
    }
    .padding(.horizontal, Deernova.space2)
    .frame(minHeight: Deernova.composerMinHeight)
    .background(.surfaceRaised, in: .rect(cornerRadius: Deernova.composerRadius))
    .shadow(color: .black.opacity(0.08), radius: 10, y: 6)

    HStack(spacing: Deernova.space2) {                        // 信息行：右下方
        Menu("Opus 5.5 · 高") { modelMenu }
        Menu("询问权限") { permissionMenu }
        ContextRing(used: contextUsed)
    }
    .font(.deernovaCallout)
    .menuStyle(.borderlessButton)
    .foregroundStyle(.inkSecondary)
}
```

放在页面底部时用 `.safeAreaInset(edge: .bottom)`，让内容可以滚到它的上方。双行布局把输入框里的 `HStack` 换成 `VStack`：上面是附件的横向 `ScrollView` 和 `TextField(axis: .vertical)`（`.lineLimit(2...8)`），下面一行是添加、工具的 `Menu`、已开启的工具标签、`Spacer()`、语音和发送；信息行不变。

## 不要

- 把 Composer 做成玻璃（它承载的是内容）；给它加描边或聚焦外圈。
- 把模型、权限、上下文用量塞进输入框里；信息行离输入框很远，或者右边缘和输入框不对齐。
- 在不同页面里调换添加、工具、语音、发送和信息行的位置。
- 输入法选词时按 Return 就发送；发送失败后清空用户写的内容。
- 附件把输入框撑高到挤掉文字区；上传中还能发送。
- 把发送按钮放到框外。
- 禁用时把按钮直接隐藏，让布局跳动。
- 提示条和输入框宽度不一致，或者离得很远。
