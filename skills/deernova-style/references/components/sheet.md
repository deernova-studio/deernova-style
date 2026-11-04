# 弹窗与底部弹窗

用于一个短小、独立的任务：确认购买、编辑一个字段、选择分享方式。触控端从底部弹出，指针端在窗口中央或附着在窗口上。

**需要提供**：标题、一两句说明、内容（短表单或选项）、主操作和取消操作；底部弹窗还要提供支持的高度档位。

## 尺寸

<!-- tokens:sheet -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `sheet-radius` | 12 | 24 | 16 | 弹窗和底部弹窗的圆角。 |
| `menu-radius` | 8 | 12 | 12 | 弹出菜单、popover 的圆角。 |
<!-- /tokens -->

- 弹窗：`surface-raised` 底、`line` 细线描边、`sheet-radius`、`shadow-float`，背后用 `scrim` 压暗。弹出菜单和 popover 用 `menu-radius`。
- 标题用 `type-title`（衬线），说明用 `callout`、`ink-secondary`，下方留 `space-4`。
- 触控端：顶部拖拽条 36×5、`line-control` 色；主操作是[大号通栏按钮](button.md)，下面是同尺寸的文字按钮「暂不需要」，两者间距 `space-1`。
- 指针端：按钮靠右排成一行，主按钮在最右边，取消在它左边。Esc 关闭。
- 内容超过一屏，或需要长时间阅读时，改成全高弹窗或推入新页面，背景用 `canvas`。
- iOS 26 上系统会把中等高度的弹窗渲染成悬浮的玻璃面板；拉到全高后变成不透明。Mac 上对应的是附着在窗口上的 sheet 和系统 Alert。直接使用系统样式。

## Web

用 `<dialog>` 和 `showModal()`：自带焦点管理、Esc 关闭和背景遮罩。

```css
.dn-sheet {
  box-sizing: border-box;
  width: min(100% - 2 * var(--page-margin), 420px);
  padding: var(--space-5);
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--sheet-radius);
  background: var(--surface-raised);
  color: var(--ink);
  box-shadow: var(--shadow-float);
}
.dn-sheet::backdrop { background: var(--scrim); }
.dn-sheet-grabber { width: 36px; height: 5px; margin: calc(var(--space-3) * -1) auto var(--space-3); border-radius: var(--radius-full); background: var(--line-control); }
.dn-sheet-title { margin: 0 0 var(--space-1); font: var(--type-title); }
.dn-sheet-body { margin: 0 0 var(--space-4); color: var(--ink-secondary); font: var(--type-callout); }
.dn-sheet-actions { display: flex; justify-content: flex-end; gap: var(--gap-stack); }
@media (pointer: coarse) {
  .dn-sheet[open] { margin: auto auto var(--space-2); }
  .dn-sheet-actions { flex-direction: column; gap: var(--space-1); }
  .dn-sheet-actions .dn-button { width: 100%; height: var(--button-height-lg); }
}
@media (pointer: fine) { .dn-sheet-grabber { display: none; } }
```

```html
<div class="dn-sheet" role="dialog" aria-labelledby="sheet-title">
  <div class="dn-sheet-grabber" aria-hidden="true"></div>
  <h3 class="dn-sheet-title" id="sheet-title">开启 iCloud 同步</h3>
  <p class="dn-sheet-body">笔记会自动同步到你登录同一 Apple 账户的所有设备。</p>
  <div class="dn-sheet-actions">
    <button class="dn-button is-plain" type="button">暂不需要</button>
    <button class="dn-button is-primary" type="button">开启</button>
  </div>
</div>
```

真实页面里外层用 `<dialog class="dn-sheet">`，打开时调用 `dialog.showModal()`。

## SwiftUI

```swift
.sheet(isPresented: $showPaywall) {
    PaywallView()
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
}

// 确认删除这类二选一的决定，用系统对话框
.confirmationDialog("删除这条笔记？", isPresented: $confirmDelete) {
    Button("删除", role: .destructive) { delete() }
}
```

## 不要

- 在弹窗里再弹一个弹窗。
- 把长篇文章放进玻璃弹窗。
- 没有取消方式；把价格之类的关键信息藏在小字里。
