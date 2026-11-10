# 弹窗、抽屉与 popover

弹窗用于一个短小、独立的任务：确认删除、编辑一个字段、选择分享方式。它会打断当前页面，背景压暗，完成或取消之后回到原处。桌面上（Web 应用、macOS）在窗口中央弹出，触屏上从底部弹出。侧边抽屉从屏幕左右边缘滑入，窄屏时用来放收起的侧边栏和侧面板。popover 附着在一个控件上，放少量说明或短表单，不打断页面。

**需要提供**：标题、一两句说明、内容（短表单或选项）、主操作和取消操作；底部弹窗还要提供支持的高度档位。危险操作要写清后果。

## 先选对控件

| 情况 | 用 |
| --- | --- |
| 告诉用户一件事，不需要回应 | [轻提示](banner.md) |
| 需要处理，但不必马上打断 | [横幅](banner.md) |
| 执行不可撤销的操作前确认 | 确认弹窗（`is-sm`）；SwiftUI 用 `.confirmationDialog` |
| 必须马上知道的错误 | 确认弹窗；SwiftUI 用 `.alert` |
| 一个短小、独立的任务 | 弹窗；触屏上是底部弹窗 |
| 附着在某个控件上的少量说明、设置或短表单 | popover；手机上改成底部弹窗 |
| 窄屏时收起的侧边栏、侧面板 | 侧边抽屉 |
| 一列命令或选项 | [菜单](menu.md) |
| 长内容、多步流程、需要长时间阅读 | 推入新页面，或者全高弹窗 |

## 尺寸

<!-- tokens:sheet -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `sheet-width-sm` | 360 | 360 | 400 | 确认弹窗、只有一两句话的提示。 |
| `sheet-width-md` | 480 | 540 | 560 | 默认宽度：短表单、选择分享方式这类短任务。 |
| `sheet-width-lg` | 720 | 720 | 800 | 预览、较长的设置，或分两栏的内容。 |
| `sheet-padding` | 20 | 20 | 24 | 弹窗内边距；标题、内容和按钮区都和它对齐。 |
| `sheet-margin` | 32 | 8 | 32 | 弹窗离窗口边缘的最小距离；触屏上底部弹窗悬浮时离屏幕边缘的距离。 |
| `sheet-radius` | 12 | 24 | 16 | 弹窗和底部弹窗的圆角。 |
| `popover-padding` | 12 | 16 | 16 | popover 的内边距；圆角用 menu-radius，宽度不超过 sheet-width-sm。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `sheet-grabber-width` | `36px` | 底部弹窗顶部拖拽条的宽度。 |
| `sheet-grabber-height` | `5px` | 拖拽条的高度。 |
<!-- /tokens -->

- 弹窗：`surface-raised` 底，`stroke-line` 宽的 `line` 色描边，圆角 `sheet-radius`，阴影 `shadow-float`，背后用 `scrim` 压暗，叠放层级 `z-overlay`（Web 的 `<dialog>` 自动放在顶层）。
- 宽度三档：确认用 `sheet-width-sm`，默认 `sheet-width-md`，预览和较长的设置用 `sheet-width-lg`；窗口太窄时，离两边各留 `sheet-margin`。最大高度是窗口高度减去上下两个 `sheet-margin`。
- 结构从上到下是标题区、内容区、按钮区，左右都是 `sheet-padding`；标题区和按钮区不随内容滚动。标题和内容之间 `space-4`，内容和按钮之间 `space-4`。
- 内容超过最大高度时，只有内容区滚动，同时在标题区下方和按钮区上方各加一条 1px 的 `line` 线，提示还有内容。内容长到要滚好几屏，就改成推入新页面。
- popover：外观和[菜单](menu.md)的面板相同（`menu-radius`、`shadow-float`、`z-dropdown`），内边距 `popover-padding`，宽度跟随内容，不超过 `sheet-width-sm`；不压暗背景。

## 内容与按钮

- 标题用 `type-title`（衬线），一句话说清这个弹窗要做什么；说明用 `callout`、`ink-secondary`。popover 的标题用 `headline`。
- 按钮文字以动词开头，说清点了会发生什么：「保存」「删除」「开启」，不用「确定」。
- 桌面上：按钮靠右排成一行，主按钮在最右边，取消在它左边。
- 触屏上：主操作是大号通栏按钮，下面是同样大小的文字按钮「取消」或「暂不需要」，两者间距 `space-1`。
- 有「取消」按钮时，不在右上角放关闭按钮。只读、没有按钮的弹窗（预览、说明）在标题区右端放一个关闭图标按钮，`aria-label="关闭"`。
- **危险确认**：标题写成问句并说出对象，例如「删除“周会记录”？」；说明写后果，例如「删除后无法恢复」。主按钮用实色的危险样式（`is-primary is-danger`），文字重复动词。默认焦点放在「取消」上，回车不会直接删除。能撤销的操作不要确认，执行后给一个带「撤销」的轻提示。

## 打开与关闭

- 打开后，焦点移到第一个输入框；没有输入框的，移到主按钮；危险确认移到「取消」。弹窗以外的内容不能操作，页面也不能滚动。
- 关闭方式：取消按钮、Esc、完成主操作。只有选项类、没有输入的弹窗，点遮罩才关闭；有输入的弹窗，点遮罩不关闭，避免误点丢掉内容。
- 有未保存的输入时，Esc、取消、下拉关闭都先问「放弃修改？」，按钮是「继续编辑」和「放弃」。这是唯一可以叠在弹窗上的确认。
- 关闭后焦点回到打开它的控件。
- 表单弹窗里，回车执行主操作；危险确认除外。
- 动效：居中的弹窗淡入并从 0.96 放大到 1，用时 `duration-slow`、缓动 `ease-enter`；关闭时淡出并缩回 0.96，用时 `duration-base`、缓动 `ease-exit`。底部弹窗和侧边抽屉整块滑入滑出，进入 `duration-slow`、退出 `duration-base`，都用 `ease-drawer`。遮罩和面板同步淡入淡出。popover 的开合和菜单相同。开启「减弱动态效果」后只保留淡入淡出。见 [动效](../foundations/motion.md)。

## 触屏上

- 底部弹窗悬浮在屏幕底部，左、右、下各留 `sheet-margin`，下方再加上安全区（`env(safe-area-inset-bottom)`）。顶部有拖拽条，`sheet-grabber-width` × `sheet-grabber-height`，`line-control` 色。
- 高度档位：中等（跟随内容，最多半屏左右）和全高。可以支持向下拖动关闭，但仍要保留取消按钮。
- 输入框聚焦、键盘弹起时，输入框要留在可见区域，不能被键盘挡住。
- 手机上不用 popover，改成底部弹窗；iPad 和平板的大屏上不要弹出撑满全屏的底部弹窗。

## 侧边抽屉

- 从面板平时所在的那一边滑入：侧边栏从左边，侧面板从右边。宽度分别是 `sidebar-width` 和 `sheet-width-md`，右侧或左侧至少露出 48px 的页面，让人知道点那里能关掉。
- `surface` 底，靠页面一侧一条 1px `line`，阴影 `shadow-float`，背后用 `scrim` 压暗；打开时页面不能滚动。
- 关闭方式：点遮罩、Esc、抽屉里的关闭按钮、选中一个导航项后自动关闭。打开后焦点移进抽屉，关闭后回到打开它的按钮。
- 触屏上可以跟手拖动关闭：拖动时去掉过渡，让抽屉跟着手指走；松手时拖过宽度的三分之一，或者向外甩得够快，就滑出关闭，否则用 `ease-drawer` 弹回原位。

## Web

- 弹窗用 `<dialog>` 和 `showModal()`：自带顶层叠放、焦点限制在弹窗内、Esc 关闭和背景遮罩，关闭后焦点回到原来的控件。用 `aria-labelledby` 指向标题，`aria-describedby` 指向说明；危险确认用 `role="alertdialog"`。初始焦点用 `autofocus` 标出。
- 表单放在 `<form>` 里，主按钮是 `type="submit"`，回车就能提交。
- 点遮罩关闭：在 `<dialog>` 的 `click` 事件里判断点击位置在面板外，再调用 `close()`。
- popover 用 `popover` 属性和 `popovertarget`：自带顶层叠放、点外面关闭和 Esc 关闭。位置规则同菜单，支持 CSS anchor positioning 的浏览器可以直接用它，否则由脚本计算。

```css
.dn-sheet {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: min(100% - 2 * var(--sheet-margin), var(--sheet-width-md));
  max-width: none;
  max-height: calc(100dvh - 2 * var(--sheet-margin));
  padding: 0;
  overflow: hidden;
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--sheet-radius);
  background: var(--surface-raised);
  color: var(--ink);
  box-shadow: var(--shadow-float);
  transition: opacity var(--duration-slow) var(--ease-enter), transform var(--duration-slow) var(--ease-enter), overlay var(--duration-slow) allow-discrete, display var(--duration-slow) allow-discrete;
}
dialog.dn-sheet:not([open]) { display: none; opacity: 0; transform: scale(0.96); transition-duration: var(--duration-base); transition-timing-function: var(--ease-exit); }
.dn-sheet.is-sm { width: min(100% - 2 * var(--sheet-margin), var(--sheet-width-sm)); }
.dn-sheet.is-lg { width: min(100% - 2 * var(--sheet-margin), var(--sheet-width-lg)); }
.dn-sheet::backdrop { background: var(--scrim); transition: opacity var(--duration-slow) var(--ease-enter), overlay var(--duration-slow) allow-discrete, display var(--duration-slow) allow-discrete; }
dialog.dn-sheet:not([open])::backdrop { opacity: 0; transition-duration: var(--duration-base); transition-timing-function: var(--ease-exit); }
@starting-style {
  .dn-sheet[open] { opacity: 0; transform: scale(0.96); }
  .dn-sheet[open]::backdrop { opacity: 0; }
}
:root:has(:is(.dn-sheet, .dn-drawer):modal) { overflow: hidden; }
.dn-drawer {
  box-sizing: border-box;
  position: fixed;
  inset: 0 auto 0 0;
  width: min(var(--sidebar-width), 100vw - var(--space-12));
  max-width: none;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 0;
  border-right: var(--stroke-line) solid var(--line);
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-float);
  transition: transform var(--duration-slow) var(--ease-drawer), opacity var(--duration-slow) var(--ease-drawer), overlay var(--duration-slow) allow-discrete, display var(--duration-slow) allow-discrete;
}
.dn-drawer.is-end { inset: 0 0 0 auto; width: min(var(--sheet-width-md), 100vw - var(--space-12)); border-right: 0; border-left: var(--stroke-line) solid var(--line); }
dialog.dn-drawer:not([open]) { display: none; transform: translateX(-100%); transition-duration: var(--duration-base); }
dialog.dn-drawer.is-end:not([open]) { transform: translateX(100%); }
.dn-drawer::backdrop { background: var(--scrim); transition: opacity var(--duration-slow) var(--ease-drawer), overlay var(--duration-slow) allow-discrete, display var(--duration-slow) allow-discrete; }
dialog.dn-drawer:not([open])::backdrop { opacity: 0; transition-duration: var(--duration-base); }
@starting-style {
  .dn-drawer[open] { transform: translateX(-100%); }
  .dn-drawer.is-end[open] { transform: translateX(100%); }
  .dn-drawer[open]::backdrop { opacity: 0; }
}
.dn-drawer.is-dragging { transition: none; }
.dn-sheet-grabber { flex: none; width: var(--sheet-grabber-width); height: var(--sheet-grabber-height); margin: var(--space-2) auto 0; border-radius: var(--radius-full); background: var(--line-control); }
.dn-sheet-head { flex: none; display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--sheet-padding) var(--sheet-padding) 0; }
.dn-sheet-heading { flex: 1; min-width: 0; }
.dn-sheet-title { margin: 0; font: var(--type-title); }
.dn-sheet-description { margin: var(--space-1) 0 0; color: var(--ink-secondary); font: var(--type-callout); }
.dn-sheet-close { flex: none; margin: calc(var(--space-1) * -1) calc(var(--space-2) * -1) 0 0; }
.dn-sheet-content { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: var(--space-4) var(--sheet-padding) 0; }
.dn-sheet-actions { flex: none; display: flex; justify-content: flex-end; gap: var(--gap-stack); padding: var(--space-4) var(--sheet-padding) var(--sheet-padding); }
.dn-sheet.is-scrollable .dn-sheet-head { padding-bottom: var(--space-4); border-bottom: var(--stroke-line) solid var(--line); }
.dn-sheet.is-scrollable .dn-sheet-content { padding-bottom: var(--space-4); }
.dn-sheet.is-scrollable .dn-sheet-actions { border-top: var(--stroke-line) solid var(--line); }
.dn-popover {
  box-sizing: border-box;
  width: max-content;
  max-width: min(var(--sheet-width-sm), 100vw - 2 * var(--space-2));
  padding: var(--popover-padding);
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--menu-radius);
  background: var(--surface-raised);
  color: var(--ink);
  box-shadow: var(--shadow-float);
  transform-origin: top left;
  transition: opacity var(--duration-base) var(--ease-enter), transform var(--duration-base) var(--ease-enter), overlay var(--duration-base) allow-discrete, display var(--duration-base) allow-discrete;
}
.dn-popover[popover] { inset: auto; margin: 0; }
.dn-popover[popover]:not(:popover-open) { opacity: 0; transform: scale(0.96); transition-duration: var(--duration-instant); transition-timing-function: var(--ease-exit); }
@starting-style { .dn-popover:popover-open { opacity: 0; transform: scale(0.96); } }
.dn-popover-title { margin: 0 0 var(--space-1); font: var(--type-headline); }
.dn-popover-text { margin: 0 0 var(--space-3); color: var(--ink-secondary); font: var(--type-callout); }
.dn-popover-row { display: flex; gap: var(--gap-inline); }
.dn-popover-row > .dn-button { flex: none; }
@media (pointer: coarse) {
  .dn-sheet { transition-timing-function: var(--ease-drawer); }
  .dn-sheet[open] { margin: auto auto calc(var(--sheet-margin) + env(safe-area-inset-bottom)); }
  dialog.dn-sheet:not([open]) { opacity: 1; transform: translateY(calc(100% + var(--sheet-margin) + env(safe-area-inset-bottom))); transition-timing-function: var(--ease-drawer); }
  @starting-style { .dn-sheet[open] { opacity: 1; transform: translateY(calc(100% + var(--sheet-margin) + env(safe-area-inset-bottom))); } }
  .dn-sheet-actions { flex-direction: column-reverse; gap: var(--space-1); }
  .dn-sheet-actions .dn-button { width: 100%; height: var(--button-height-lg); }
}
@media (pointer: fine) { .dn-sheet-grabber { display: none; } }
@media (prefers-reduced-motion: reduce) {
  dialog.dn-sheet:not([open]), dialog.dn-drawer:not([open]) { opacity: 0; transform: none; }
  .dn-popover[popover]:not(:popover-open) { transform: none; }
  @starting-style {
    .dn-sheet[open], .dn-drawer[open] { opacity: 0; transform: none; }
    .dn-popover:popover-open { transform: none; }
  }
}
```

```html
<div class="dn-sheet" role="dialog" aria-modal="true" aria-labelledby="rename-title" aria-describedby="rename-desc">
  <div class="dn-sheet-grabber" aria-hidden="true"></div>
  <div class="dn-sheet-head">
    <div class="dn-sheet-heading">
      <h3 class="dn-sheet-title" id="rename-title">重命名笔记</h3>
      <p class="dn-sheet-description" id="rename-desc">新名称会同步到你的所有设备。</p>
    </div>
  </div>
  <div class="dn-sheet-content">
    <div class="dn-field">
      <label class="dn-field-label" for="note-name">名称</label>
      <input class="dn-input" id="note-name" value="周会记录">
    </div>
  </div>
  <div class="dn-sheet-actions">
    <button class="dn-button is-plain" type="button">取消</button>
    <button class="dn-button is-primary" type="submit">保存</button>
  </div>
</div>
```

真实页面里外层用 `<dialog class="dn-sheet">`，内容和按钮放在 `<form>` 里，输入框加 `autofocus`，打开时调用 `dialog.showModal()`。内容能滚动时，由脚本给弹窗加上 `is-scrollable`。

危险确认用窄的一档，没有内容区：

```html
<div class="dn-sheet is-sm" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-desc">
  <div class="dn-sheet-grabber" aria-hidden="true"></div>
  <div class="dn-sheet-head">
    <div class="dn-sheet-heading">
      <h3 class="dn-sheet-title" id="delete-title">删除“周会记录”？</h3>
      <p class="dn-sheet-description" id="delete-desc">删除后无法恢复，共享链接也会失效。</p>
    </div>
  </div>
  <div class="dn-sheet-actions">
    <button class="dn-button is-plain" type="button">取消</button>
    <button class="dn-button is-primary is-danger" type="button">删除</button>
  </div>
</div>
```

popover 附着在打开它的按钮下方：

```html
<div class="dn-popover" role="dialog" aria-labelledby="share-title">
  <h3 class="dn-popover-title" id="share-title">共享链接</h3>
  <p class="dn-popover-text">拿到链接的人都可以查看这条笔记。</p>
  <div class="dn-popover-row">
    <input class="dn-input" value="deernova.app/n/8f3k" readonly aria-label="共享链接">
    <button class="dn-button" type="button">复制</button>
  </div>
</div>
```

真实页面里，popover 用 `<div class="dn-popover" popover id="share">`，打开它的按钮加 `popovertarget="share"`。

侧边抽屉用 `<dialog class="dn-drawer">`（侧面板加 `is-end`），打开时调用 `showModal()`。跟手拖动时给它加 `is-dragging`，用 `transform` 跟随手指，松手后去掉 `is-dragging`，再决定 `close()` 还是弹回。

## SwiftUI

在 iOS 26 上，中等高度的弹窗由系统渲染成悬浮的玻璃面板，拉到全高后变成不透明；Mac 上对应的是附着在窗口上的 sheet 和系统 Alert。直接用系统样式，不要用 `.presentationBackground` 盖掉它。

```swift
// 短任务：iPhone 上是底部弹窗，iPad 和 Mac 上是居中的表单弹窗
.sheet(isPresented: $showRename) {
    RenameView()
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .presentationSizing(.form)
        .interactiveDismissDisabled(hasChanges)   // 有未保存的输入时，不能下拉关闭
}

// 危险确认：iPhone 上从底部弹出，iPad 和 Mac 上附着在按钮上
.confirmationDialog("删除“周会记录”？", isPresented: $confirmDelete, titleVisibility: .visible) {
    Button("删除", role: .destructive) { delete() }
} message: {
    Text("删除后无法恢复，共享链接也会失效。")
}

// 必须马上知道的错误
.alert("无法同步", isPresented: $syncFailed) {
    Button("重试") { sync() }
    Button("取消", role: .cancel) {}
} message: {
    Text("网络连接已断开。")
}

// 附着在控件上的小面板；iPhone 上系统会自动改成底部弹窗
.popover(isPresented: $showShare) {
    ShareLinkView()
        .padding(Deernova.popoverPadding)
}
```

只在 iOS 上、需要占满整屏的流程（新手引导、拍照）用 `.fullScreenCover`。

## 不要

- 在弹窗里再弹一个弹窗（「放弃修改？」的确认除外）；在弹窗里做多步流程。
- 把长篇文章放进玻璃弹窗。
- 没有取消方式；把价格之类的关键信息藏在小字里。
- 按钮写「确定」「OK」；危险确认把默认焦点放在危险按钮上。
- 用弹窗告诉用户“已保存”这类不需要回应的消息（用轻提示）。
- 有输入的弹窗点遮罩就关闭，丢掉用户填的内容。
- 在手机上弹 popover，或者在 iPad 大屏上弹撑满全屏的底部弹窗。
