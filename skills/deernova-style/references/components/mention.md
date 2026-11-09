# 提及与命令

在 [Composer](composer.md) 里输入一个触发符，从光标处弹出建议浮层；选中一项后，它变成文字里一个不可拆开的标签。`@` 用来提到文件、文件夹、网页、人或子 agent，`/` 用来执行命令，`#` 用来引用笔记、文档或历史会话。三种触发符共用同一种浮层和同一种标签，只是数据源不同。

**需要提供**：每种触发符对应的数据源（名称、类型图标、一句说明、路径或快捷键），选中后插入的标签内容，没有结果时的说明。

## 尺寸

<!-- tokens:mention -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `mention-height` | 20 | 24 | 22 | 文字里提及标签的高度，放进正文的一行里不撑高行距。 |
| `mention-padding-x` | 4 | 6 | 6 | 提及标签左右内边距。 |
| `mention-radius` | 4 | 6 | 6 | 提及标签圆角。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `suggest-width` | `360px` | @、/、# 建议浮层的宽度；窄屏时和 Composer 同宽。 |
<!-- /tokens -->

- 浮层外观和[菜单](menu.md)相同：`surface-raised` 底、`line` 描边、`menu-radius`、`shadow-float`、内边距 `menu-padding`，每一项高 `menu-item-height`；宽 `suggest-width`，窄屏时和 Composer 同宽。
- 标签在文字里占一个字的位置：高 `mention-height`，左右内边距 `mention-padding-x`，圆角 `mention-radius`，`fill-selected` 底、`ink` 字，前面一个 `icon-size-sm` 的类型图标；文字和正文同字号，基线和正文对齐。

## 触发

| 触发符 | 用途 | 浮层里的每一项 |
| --- | --- | --- |
| `@` | 文件、文件夹、网页、人、子 agent | 类型图标、名称、右侧灰色的路径或说明 |
| `/` | 命令：总结、翻译、审查、清空上下文 | 命令名（等宽）、一句说明、右侧快捷键 |
| `#` | 笔记、文档、历史会话 | 类型图标、标题、右侧的更新时间 |

- 只在行首或空格后面输入触发符时弹出，邮箱地址里的 `@`、网址里的 `/` 不触发。`/` 命令只在整段的开头有效，写在句子中间按普通文字处理。
- 输入法正在选词时不触发，选完再判断。
- 只有一种触发符的产品，也可以在 Composer 里放一个对应的按钮（「添加上下文」），点开是同一个浮层。

## 浮层

- **位置**：从光标所在的行向上弹出，左边缘和触发符对齐，间距 `menu-offset`；上方放不下才翻到下方。Composer 通常在窗口底部，向下弹会被挡住。
- **焦点留在输入框里**：用户可以继续打字筛选。↑↓ 移动高亮（到头后回到另一端），Enter 或 Tab 选中，Esc 关闭并保留已经输入的「@文字」，继续删除到触发符之前也会关闭。指针悬停只移动高亮，点击选中。
- **筛选**：边输入边过滤，匹配上的字用 `weight-semibold`；按「最近用过」「当前项目」等分组，组标题见菜单的分组标题；最多显示 8 项，更多时浮层内部滚动。
- **加载和空结果**：远程搜索时第一项位置显示「正在搜索」和小转圈；没有结果时显示一行「没有匹配的文件」，`ink-tertiary`，浮层不消失，直到用户删除或按 Esc。
- 高亮项用 `fill-hover`；当前项右侧的说明可以比其他项多显示一些（比如完整路径）。

## 标签

- 选中后，触发符和输入的字被替换成一个标签，后面自动补一个空格，光标停在空格后面。
- 标签是一个整体：光标不能进入标签里；在标签后按一次退格，先选中整个标签，再按一次删除，避免误删。
- 悬停标签显示完整信息（文件的完整路径、网页标题、人的全名），用 [tooltip](tooltip.md)；文件已经不存在时，标签变成删除线和 `ink-tertiary`，发送前提示。
- `/` 命令的标签固定在整段最前面，用等宽字显示命令名；一段里只能有一个命令。
- 发送后，消息里的标签保持同样的外观；点击文件标签可以打开预览。
- 被提到的文件、网页也算进上下文：它们和附件一样会随消息发出，上下文用量跟着更新。

## Web

- 输入框用 `contenteditable` 或编辑器库实现标签；如果只能用 `<textarea>`，就把标签渲染成覆盖层，并在提交时还原成结构化数据，不要只发一串「@文件名」文字。
- 读屏：输入框用 `role="combobox"`、`aria-expanded`、`aria-controls` 指向浮层，浮层 `role="listbox"`，项 `role="option"`，高亮项用 `aria-activedescendant` 指出；焦点不离开输入框。

```css
.dn-suggest {
  box-sizing: border-box;
  width: min(var(--suggest-width), 100%);
  max-height: calc(var(--menu-item-height) * 8 + var(--menu-padding) * 2);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--menu-padding);
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--menu-radius);
  background: var(--surface-raised);
  color: var(--ink);
  box-shadow: var(--shadow-float);
}
.dn-suggest-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: var(--menu-item-height);
  padding: 0 var(--menu-item-padding-x);
  border-radius: calc(var(--menu-radius) - var(--menu-padding));
  font: var(--weight-regular) var(--menu-font-size)/1 var(--font-sans);
  white-space: nowrap;
  cursor: pointer;
}
.dn-suggest-item[aria-selected="true"] { background: var(--fill-hover); }
.dn-suggest-item > .dn-icon { flex: none; width: var(--icon-size-md); height: var(--icon-size-md); color: var(--ink-secondary); }
.dn-suggest-name { flex: none; max-width: 60%; overflow: hidden; text-overflow: ellipsis; }
.dn-suggest-name mark { background: none; color: inherit; font-weight: var(--weight-semibold); }
.dn-suggest-name.is-command { font-family: var(--font-mono); font-size: calc(var(--menu-font-size) - 1px); }
.dn-suggest-detail { flex: 1; min-width: 0; overflow: hidden; color: var(--ink-tertiary); text-overflow: ellipsis; }
.dn-suggest-meta { flex: none; margin-inline-start: auto; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); font-variant-numeric: tabular-nums; }
.dn-suggest-heading { padding: var(--space-2) var(--menu-item-padding-x) var(--space-1); color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); }
.dn-suggest-empty { padding: 0 var(--menu-item-padding-x); color: var(--ink-tertiary); font: var(--weight-regular) var(--menu-font-size)/var(--menu-item-height) var(--font-sans); }
.dn-mention {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: var(--mention-height);
  padding: 0 var(--mention-padding-x);
  border-radius: var(--mention-radius);
  background: var(--fill-selected);
  color: var(--ink);
  font: inherit;
  line-height: 1;
  white-space: nowrap;
  vertical-align: baseline;
  user-select: all;
}
.dn-mention > .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); color: var(--ink-secondary); }
.dn-mention.is-command { font-family: var(--font-mono); font-size: 0.92em; }
.dn-mention.is-missing { color: var(--ink-tertiary); text-decoration: line-through; }
.dn-compose-text { flex: 1; min-width: 0; padding: calc((var(--button-height-md) - var(--type-body-line)) / 2) var(--space-1); color: var(--ink); font: var(--type-body); outline: none; }
```

```html
<div class="dn-composer-stack">
  <div class="dn-suggest" role="listbox" id="suggest" aria-label="文件">
    <div class="dn-suggest-heading">最近用过</div>
    <div class="dn-suggest-item" role="option" aria-selected="true" id="s1"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg><span class="dn-suggest-name"><mark>周</mark>报草稿.md</span><span class="dn-suggest-meta">docs/weekly</span></div>
    <div class="dn-suggest-item" role="option" aria-selected="false"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg><span class="dn-suggest-name"><mark>周</mark>会记录.md</span><span class="dn-suggest-meta">notes</span></div>
    <div class="dn-suggest-heading">当前项目</div>
    <div class="dn-suggest-item" role="option" aria-selected="false"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><span class="dn-suggest-name"><mark>周</mark>报模板</span><span class="dn-suggest-meta">templates</span></div>
  </div>
  <div class="dn-composer">
    <button class="dn-icon-button" type="button" aria-label="添加" aria-haspopup="menu"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
    <div class="dn-compose-text" role="combobox" aria-expanded="true" aria-controls="suggest" aria-activedescendant="s1" aria-label="消息"><span class="dn-mention is-command">/总结</span> 把 <span class="dn-mention"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>需求文档.md</span> 和 @周</div>
    <button class="dn-send" type="button" aria-label="发送"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
  </div>
</div>
```

示例里浮层画在 Composer 上方的静态位置；真实页面里它跟着光标定位。

## SwiftUI

SwiftUI 的 `TextField` 不支持行内标签。原生端有两种做法：用 `TextEditor` 加 `AttributedString` 给提及的文字加底色，标签之外的文字照常编辑；或者把选中的提及显示成 Composer 附件行里的上下文标签，文字里只保留名称。浮层用 `.popover` 或自己画在 Composer 上方，列表用 `List(selection:)`，方向键和回车交给系统。

## 不要

- 邮箱、网址里的 `@`、`/` 也弹浮层；输入法选词时弹浮层。
- 选中后只插入一串「@文件名」文字，删除时一个字一个字删；光标能进到标签中间。
- 浮层把输入框挡住，或者焦点跳进浮层，打字被打断。
- 没有结果时浮层直接消失，用户不知道发生了什么。
- 给标签用彩色区分类型；类型靠图标。
