# 命令面板

按 ⌘K（Windows 上 Ctrl-K）在屏幕上方弹出一个搜索框，输入几个字就能找到任何命令、页面、会话或文件，回车执行。它是全局的入口，和输入框里的 [`/` 命令](mention.md)是两回事：`/` 作用于正在写的这条消息，命令面板作用于整个应用。

**需要提供**：可以搜索的内容（命令、页面、会话、文件、设置项），每项的名称、类型图标、快捷键，最近用过的项，以及没有结果时可以做的事（例如「用 AI 回答」）。

## 尺寸

<!-- tokens:command -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `command-input-height` | 48 | 52 | 52 | 命令面板搜索框的高度。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `command-width` | `560px` | 命令面板的宽度。 |
<!-- /tokens -->

- 面板：宽 `command-width`（窗口窄时两边留 `sheet-margin`），离窗口顶部 15% 的高度；`surface-raised` 底、`line` 描边、`sheet-radius`、`shadow-float`；背后是比弹窗更淡的遮罩（`scrim` 的一半），页面仍然隐约可见。
- 搜索框：高 `command-input-height`，在面板顶部，左边搜索图标，右边 `caption` 的「Esc」提示；没有底色和边框，下面一条 1px `line`。文字 `type-body`。
- 结果列表：项和[菜单](menu.md)的菜单项同规格（`menu-item-height`、`menu-radius` 减内边距的圆角）；分组标题和菜单的分组标题一样；列表最高 8 项，超出时内部滚动。
- 每一项：类型图标（`icon-size-md`、`ink-secondary`）、名称（匹配的字 `weight-semibold`）、右侧灰色的说明或所在位置、最右边的快捷键（`caption`、`ink-tertiary`、键帽之间不加空格）。

## 行为

- **打开**：⌘K 在任何地方都能打开（输入框里也可以）；再按一次 ⌘K 或 Esc 关闭，焦点回到原处。打开时搜索框自动获得焦点，上次的输入不保留。
- **没有输入时**：显示「最近」和「常用」两组，每组最多 5 项。
- **搜索**：边输入边过滤，按匹配程度排序，同一类放在一组；拼音首字母也能匹配（输入「zbcg」找到「周报草稿」）。远程搜索时，列表底部显示「正在搜索」。
- **键盘**：↑↓ 移动（到头后回到另一端），Enter 执行，⌘-Enter 在新标签或侧面板里打开；输入 `>` 只搜命令，输入 `#` 只搜会话（可选）。
- **执行**：执行后面板关闭；需要参数的命令（「移到…」）在面板里进入第二级，搜索框左边出现一个可以删除的标签显示当前命令，Backspace 退回上一级。
- **没有结果**：显示「没有找到“关键词”」，下面给一两个可以做的事：「用 AI 回答“关键词”」「在全部笔记里搜索」。

## Web

用 `<dialog>` 的 `showModal()` 承载，焦点管理和 Esc 交给浏览器；搜索框 `role="combobox"`，列表 `role="listbox"`，用 `aria-activedescendant` 指出当前项，焦点始终留在搜索框里。开合动效和[弹窗](sheet.md)相同但更快：进入 `duration-base`、退出 `duration-instant`。

```css
.dn-command {
  box-sizing: border-box;
  width: min(100% - 2 * var(--sheet-margin), var(--command-width));
  max-width: none;
  padding: 0;
  overflow: hidden;
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--sheet-radius);
  background: var(--surface-raised);
  color: var(--ink);
  box-shadow: var(--shadow-float);
}
dialog.dn-command { margin: 15vh auto auto; }
.dn-command::backdrop { background: color-mix(in srgb, var(--scrim) 50%, transparent); }
.dn-command-search { display: flex; align-items: center; gap: var(--space-2); height: var(--command-input-height); padding: 0 var(--space-4); border-bottom: var(--stroke-line) solid var(--line); color: var(--ink-tertiary); }
.dn-command-search > .dn-icon { flex: none; width: var(--icon-size-md); height: var(--icon-size-md); }
.dn-command-search > input { flex: 1; min-width: 0; height: 100%; padding: 0; border: 0; outline: none; background: transparent; color: var(--ink); font: var(--type-body); }
.dn-command-search > input::placeholder { color: var(--ink-tertiary); }
.dn-command-scope { display: inline-flex; align-items: center; height: var(--mention-height); padding: 0 var(--mention-padding-x); border-radius: var(--mention-radius); background: var(--fill-selected); color: var(--ink); font: var(--type-callout); white-space: nowrap; }
.dn-kbd { flex: none; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); letter-spacing: 0.04em; }
.dn-command-list { max-height: calc(var(--menu-item-height) * 8 + var(--menu-padding) * 2 + var(--space-6) * 2); overflow-y: auto; overscroll-behavior: contain; padding: var(--menu-padding); }
.dn-command-list .dn-suggest-item .dn-kbd { margin-inline-start: var(--space-3); }
.dn-command-empty { padding: var(--space-4) var(--menu-item-padding-x) var(--space-2); color: var(--ink-secondary); font: var(--type-callout); }
```

```html
<div class="dn-command" role="dialog" aria-label="命令面板">
  <div class="dn-command-search">
    <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg>
    <input role="combobox" aria-expanded="true" aria-controls="cmd-list" aria-activedescendant="cmd-1" aria-label="搜索命令、会话和文件" value="周报" placeholder="搜索命令、会话和文件">
    <span class="dn-kbd">Esc</span>
  </div>
  <div class="dn-command-list" role="listbox" id="cmd-list">
    <div class="dn-suggest-heading">会话</div>
    <div class="dn-suggest-item" role="option" id="cmd-1" aria-selected="true"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/></svg><span class="dn-suggest-name"><mark>周报</mark>整理成三条要点</span><span class="dn-suggest-detail">昨天</span></div>
    <div class="dn-suggest-heading">文件</div>
    <div class="dn-suggest-item" role="option" aria-selected="false"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg><span class="dn-suggest-name"><mark>周报</mark>草稿.md</span><span class="dn-suggest-detail">docs/weekly</span></div>
    <div class="dn-suggest-heading">命令</div>
    <div class="dn-suggest-item" role="option" aria-selected="false"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span class="dn-suggest-name">新建<mark>周报</mark></span><span class="dn-suggest-detail">从模板创建</span><span class="dn-kbd">⌘N</span></div>
  </div>
</div>
```

示例里面板画在页面里；真实页面用 `<dialog class="dn-command">` 加 `showModal()`。

## SwiftUI

Mac 上命令面板是自己画的浮动面板：用 `.sheet` 或一个无标题栏的 `Window`，内容是 `TextField` 加 `List(selection:)`，用 `.keyboardShortcut("k")` 打开、`.onKeyPress(.escape)` 关闭；同时把常用命令放进菜单栏（`CommandMenu`），让系统的「帮助 › 搜索」也能找到。iOS 上用 `.searchable` 加搜索建议，不做浮动面板。

## 不要

- 把命令面板做成只有命令、找不到会话和文件的列表。
- 打开时不自动聚焦搜索框；关闭后焦点丢失。
- 每次打开都保留上次的输入；没有结果时只显示一片空白。
- 背景压得太暗，或者面板从屏幕中间弹出挡住正在看的内容。
