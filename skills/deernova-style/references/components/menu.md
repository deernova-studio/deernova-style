# 菜单与下拉

从一个按钮或下拉框弹出的一列选项。它有三种用途：对当前对象执行的命令（⋯ 按钮、右键），从一组值里选一个（下拉选择），一组跳转链接（产品切换、账户）。

**需要提供**：触发它的控件（按钮、图标按钮或下拉框）、每一项的文字，以及可选的图标、快捷键和当前值；危险操作要单独标出。

## 先选对控件

| 需要 | 用 |
| --- | --- |
| 2–4 个互斥选项，需要一直看得见 | [分段控件](segmented.md) |
| 表单里从一组值中选一个 | 下拉选择：Web 用原生 `select`，SwiftUI 用 `Picker` |
| 对当前对象执行的一组命令 | 菜单：⋯ 图标按钮、右键、长按 |
| 一组跳转链接（产品切换、账户） | 展开式链接列表，外观和菜单相同 |
| 选项多到需要搜索，或者要放表单、说明文字 | 可搜索的下拉框（combobox）、[popover 或弹窗](sheet.md) |

## 尺寸

<!-- tokens:menu -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `menu-item-height` | 28 | 44 | 36 | 菜单项和下拉选项的高度。 |
| `menu-item-padding-x` | 8 | 10 | 10 | 菜单项左右内边距。 |
| `menu-font-size` | 14 | 17 | 15 | 菜单项字号。 |
| `menu-padding` | 4 | 6 | 6 | 菜单面板的内边距，也是分隔线上下的间距。 |
| `menu-radius` | 8 | 12 | 12 | 菜单和 popover 的圆角；菜单项的圆角 = 它减去 menu-padding。 |
| `menu-offset` | 4 | 8 | 8 | 菜单和触发它的控件之间的距离。 |
| `menu-min-width` | 160 | 220 | 200 | 菜单最小宽度；同时不窄于触发器。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `menu-max-width` | `320px` | 菜单最大宽度；放不下的文字用省略号。 |
<!-- /tokens -->

- 面板：`surface-raised` 底，`stroke-line` 宽的 `line` 色描边，圆角 `menu-radius`，阴影 `shadow-float`，叠放层级 `z-dropdown`，内边距 `menu-padding`。
- 菜单项：高度 `menu-item-height`，上下内边距为 0，文字行高 1，常规字重，`ink` 色。圆角等于 `menu-radius` 减 `menu-padding`，和面板同心。
- 宽度：跟随内容，不窄于 `menu-min-width`，不宽于 `menu-max-width`；从按钮或下拉框展开时，也不窄于它。文字只占一行，放不下时用省略号，不换行。
- 图标用 `icon-size-md`，和文字间距 `space-2`。产品图标、头像这类图像可以用 `icon-size-lg`。同一个菜单里，要么每项都有图标，要么都没有。
- 快捷键靠右放，`caption` 字号、`ink-tertiary` 色，和文字之间至少 `space-6`。
- 分组之间放一条 1px 的 `line` 色分隔线，左右缩进 `menu-item-padding-x`，上下各留 `menu-padding`。分组标题用 `caption` 字号、常规字重、`ink-tertiary` 色。
- 有子菜单的项，在右端放一个 `icon-size-sm` 的右箭头，用 `ink-tertiary` 色。子菜单最多一层，从父项右侧展开，顶部和父项对齐。
- 文案：动词开头，不加句号。点了之后还要再输入或确认的命令，在文字后加「…」，例如「导出…」。
- 官网吸顶的玻璃页眉展开的菜单，可以沿用页眉的玻璃（`.dn-menu.is-glass`），用户开启「降低透明度」后换回 `surface-raised`；整条页眉都是触发器时，菜单从页眉左边缘展开，宽度取页眉的一半，不受 `menu-max-width` 限制。Web 应用里的菜单不用玻璃。

## 状态

- **高亮**：指针悬停或键盘移到的那一项铺 `fill-hover`。同一时间只高亮一项：指针移到哪一项，焦点就跟到哪一项。键盘操作时再加一圈内描边焦点环（`focus-ring`），只在 `:focus-visible` 时出现。
- **当前值**：下拉选项和可勾选的命令，在最左侧留一列 `icon-size-sm` 宽的对勾位，当前选中的项显示对勾，其余项留空，保证文字对齐。不要用 `fill-selected` 底色表示当前值。
- **禁用**：整项降到 `opacity-disabled`，指针点不了，方向键会跳过它。暂时不能用的命令留在原处并禁用，不要隐藏，否则菜单的布局每次都会变。
- **危险操作**：文字用 `danger` 色，放在最后，前面加一条分隔线；高亮时的底色不变红。执行前用 [弹窗](sheet.md) 确认，能撤销的操作除外。

## 位置与开合

- 默认在触发器下方 `menu-offset` 处展开，左边对齐；从靠右的按钮弹出时，改成右边对齐。下方放不下就翻到上方；上下都放不下时限制最大高度，在面板内部滚动，并用 `overscroll-behavior: contain` 防止带动页面滚动。面板离窗口边缘至少留 `space-2`。
- 点击触发器打开，再点一次关闭；不要在悬停时打开。选中一项、按 Esc、点击菜单外面、焦点移出菜单，都会关闭菜单。按 Esc 关闭或选中一项后，焦点回到触发器。
- 右键菜单在指针位置展开，其他规则相同。
- 打开时淡入，同时从 0.98 放大到 1，用时 `duration-instant`、缓动 `ease-standard`，从触发器那一侧展开；关闭时直接消失。开启「减弱动态效果」后只保留淡入。

## 键盘

- **在触发器上**：Enter 或 Space 打开菜单；↓ 打开并移到第一项，↑ 打开并移到最后一项。
- **在菜单里**：↑↓ 逐项移动，到头后从另一端继续；Home、End 跳到第一项、最后一项；输入字母跳到以它开头的项；Enter 执行（命令菜单里 Space 也可以）；→ 打开子菜单，← 关闭子菜单并回到父项；Esc 关闭菜单。
- Tab 关闭菜单，焦点按正常顺序移到下一个控件，不要把焦点困在菜单里。

## Web

按用途选择语义：

- **跳转链接**（产品切换、文档目录）：用展开式（disclosure）。触发器是带 `aria-expanded`、`aria-controls` 的 `<button>`，面板是 `<nav>` 里的链接列表，不加 `role="menu"`。方向键只是额外的便利。
- **命令**：触发器加 `aria-haspopup="menu"` 和 `aria-expanded`；面板用 `role="menu"`，项用 `role="menuitem"`，可勾选的项用 `menuitemcheckbox` 或 `menuitemradio` 加 `aria-checked`。打开后焦点移进菜单，菜单里只有当前项能被 Tab 到（roving tabindex）。快捷键用 `aria-keyshortcuts` 标出。
- **选一个值**：先用原生 `<select>`，外面包一层 `.dn-select`，就能得到和输入框一样的外观；它弹出的列表由系统绘制，不要改。只有选项需要图标或两行文字时才自己画：触发器用 `<button aria-haspopup="listbox">`，面板用 `role="listbox"`，项用 `role="option"` 加 `aria-selected`。需要搜索时用 `role="combobox"`。
- 祖先元素有 `overflow: hidden`、会把菜单裁掉时，给面板加 `popover` 属性放到顶层，或者把面板挂到 `body` 下面再定位。

```css
.dn-menu-anchor { position: relative; display: inline-block; }
.dn-menu-anchor > .dn-menu { position: absolute; top: calc(100% + var(--menu-offset)); left: 0; z-index: var(--z-dropdown); min-width: max(var(--menu-min-width), 100%); }
.dn-menu-anchor > .dn-menu.is-end { left: auto; right: 0; transform-origin: top right; }
.dn-menu-anchor > .dn-menu.is-above { top: auto; bottom: calc(100% + var(--menu-offset)); transform-origin: bottom left; }
.dn-menu-anchor > .dn-menu.is-above.is-end { transform-origin: bottom right; }
.dn-menu {
  box-sizing: border-box;
  min-width: var(--menu-min-width);
  max-width: min(var(--menu-max-width), 100vw - 2 * var(--space-2));
  max-height: min(24rem, 100dvh - 2 * var(--space-2));
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--menu-padding);
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--menu-radius);
  background: var(--surface-raised);
  color: var(--ink);
  box-shadow: var(--shadow-float);
  transform-origin: top left;
  transition: opacity var(--duration-instant) var(--ease-standard), transform var(--duration-instant) var(--ease-standard);
}
.dn-menu[hidden] { display: none; }
@starting-style { .dn-menu { opacity: 0; transform: scale(0.98); } }
.dn-menu.is-glass { border-color: var(--glass-stroke); background: var(--glass-fill); -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)); backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)); }
.dn-menu-item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  height: var(--menu-item-height);
  padding: 0 var(--menu-item-padding-x);
  border: 0;
  border-radius: calc(var(--menu-radius) - var(--menu-padding));
  background: none;
  color: var(--ink);
  font: var(--weight-regular) var(--menu-font-size)/1 var(--font-sans);
  text-align: start;
  text-decoration: none;
  white-space: nowrap;
}
.dn-menu-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.dn-menu-shortcut { margin-inline-start: var(--space-6); color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); font-variant-numeric: tabular-nums; }
.dn-menu-item > .dn-menu-check { width: var(--icon-size-sm); height: var(--icon-size-sm); visibility: hidden; }
.dn-menu-item:is([aria-checked="true"], [aria-selected="true"]) > .dn-menu-check { visibility: visible; }
.dn-menu-item > .dn-menu-more { width: var(--icon-size-sm); height: var(--icon-size-sm); color: var(--ink-tertiary); }
@media (hover: hover) { .dn-menu-item:hover { background: var(--fill-hover); } }
.dn-menu-item:focus { outline: none; }
.dn-menu-item:focus-visible, .dn-menu-item[aria-expanded="true"] { background: var(--fill-hover); }
.dn-menu-item:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: calc(var(--stroke-focus) * -1); }
.dn-menu-item.is-danger { color: var(--danger); }
.dn-menu-item[aria-disabled="true"] { opacity: var(--opacity-disabled); pointer-events: none; }
.dn-menu-separator { height: var(--stroke-line); margin: var(--menu-padding) var(--menu-item-padding-x); border: 0; background: var(--line); }
.dn-menu-heading { padding: var(--space-2) var(--menu-item-padding-x) var(--space-1); color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); }
.dn-select { position: relative; display: grid; min-width: 0; }
.dn-select > :is(select, button) {
  box-sizing: border-box;
  width: 100%;
  height: var(--field-height);
  padding: 0 calc(var(--field-padding-x) + var(--icon-size-sm) + var(--space-1)) 0 var(--field-padding-x);
  border: var(--stroke-control) var(--line-style-divider) var(--line-control);
  border-radius: var(--field-radius);
  background: var(--surface-raised);
  color: var(--ink);
  font: var(--weight-regular) var(--field-font-size)/1.2 var(--font-sans);
  text-align: start;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  appearance: none;
}
.dn-select > :is(select, button):focus-visible { outline: none; border-color: var(--focus-ring); box-shadow: 0 0 0 3px var(--accent-soft); }
.dn-select > .dn-select-chevron { position: absolute; top: 50%; right: var(--field-padding-x); width: var(--icon-size-sm); height: var(--icon-size-sm); color: var(--ink-tertiary); translate: 0 -50%; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .dn-menu { transition-property: opacity; } }
@media (prefers-reduced-transparency: reduce) { .dn-menu.is-glass { background: var(--surface-raised); -webkit-backdrop-filter: none; backdrop-filter: none; } }
```

```html
<div class="dn-row is-top">
  <div class="dn-field">
    <span class="dn-field-label" id="sort-label">排序</span>
    <div class="dn-select">
      <button type="button" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="sort-label sort-value"><span id="sort-value">最近编辑</span></button>
      <svg class="dn-icon dn-select-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
    </div>
    <div class="dn-menu" role="listbox" aria-labelledby="sort-label">
      <div class="dn-menu-item" role="option" aria-selected="true"><svg class="dn-icon dn-menu-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><span class="dn-menu-label">最近编辑</span></div>
      <div class="dn-menu-item" role="option" aria-selected="false"><svg class="dn-icon dn-menu-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><span class="dn-menu-label">创建时间</span></div>
      <div class="dn-menu-item" role="option" aria-selected="false"><svg class="dn-icon dn-menu-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><span class="dn-menu-label">标题</span></div>
    </div>
  </div>
  <div class="dn-menu" role="menu" aria-label="笔记">
    <button class="dn-menu-item" type="button" role="menuitem" aria-keyshortcuts="Meta+R"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg><span class="dn-menu-label">重命名</span><span class="dn-menu-shortcut">⌘R</span></button>
    <button class="dn-menu-item" type="button" role="menuitem" aria-keyshortcuts="Shift+Meta+C"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg><span class="dn-menu-label">复制链接</span><span class="dn-menu-shortcut">⇧⌘C</span></button>
    <button class="dn-menu-item" type="button" role="menuitem" aria-haspopup="menu" aria-expanded="false"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><span class="dn-menu-label">移到</span><svg class="dn-icon dn-menu-more" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
    <button class="dn-menu-item" type="button" role="menuitem" aria-disabled="true"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 9l5-5 5 5M5 20h14"/></svg><span class="dn-menu-label">导出…</span></button>
    <div class="dn-menu-separator" role="separator"></div>
    <button class="dn-menu-item is-danger" type="button" role="menuitem"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg><span class="dn-menu-label">删除</span></button>
  </div>
</div>
```

示例里的两个面板都画成展开状态。真实页面里，把触发器和面板一起放进 `.dn-menu-anchor`，用 `hidden` 控制开合；空间不够时，由脚本给面板加 `is-above` 或 `is-end`。

## SwiftUI

在 iOS 26 和 macOS 26 上，系统菜单自动渲染成 Liquid Glass，尺寸、键盘操作和无障碍也都由系统处理。直接用 `Menu`、`Picker`、`.contextMenu`，不要自己画菜单。

```swift
// 命令：⋯ 按钮
Menu {
    Button("重命名", systemImage: "pencil") { rename() }
        .keyboardShortcut("r")
    Button("复制链接", systemImage: "link") { copyLink() }
    Menu("移到", systemImage: "folder") {
        ForEach(folders) { folder in
            Button(folder.name) { move(to: folder) }
        }
    }
    Divider()
    Button("删除", systemImage: "trash", role: .destructive) { confirmDelete = true }
} label: {
    Label("更多", systemImage: "ellipsis")
}

// 选一个值：系统会给当前值打上对勾
Picker("排序", selection: $sort) {
    ForEach(SortOrder.allCases) { Text($0.title).tag($0) }
}
.pickerStyle(.menu)

// 右键（Mac）和长按（iOS）
.contextMenu {
    Button("复制链接", systemImage: "link") { copyLink() }
}
```

iOS 上选项很多（例如选择国家）或者需要搜索时，推入一个新页面（`Picker` 加 `.pickerStyle(.navigationLink)`），或者用 [底部弹窗](sheet.md)。

## 不要

- 把一屏的主要操作藏进菜单；主要操作放在按钮上。
- 悬停时就打开菜单；子菜单超过一层。
- 只有 2–4 个选项还用下拉（改用分段控件）；十几个以上的选项不提供搜索。
- 给导航链接加 `role="menu"`；原生 `select` 能完成的选择，也自己画。
- 在菜单里放段落、输入框或开关；需要这些时改用 [popover 或弹窗](sheet.md)。
- 用彩色图标或彩色底色区分选项；颜色只留给危险操作的文字。
- 在 macOS、iOS 上自己画菜单，或者给系统菜单加实色背景。
- 在 Web 应用的菜单上用玻璃或模糊效果（官网页眉展开的菜单除外）。
