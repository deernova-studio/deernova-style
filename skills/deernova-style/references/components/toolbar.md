# 顶栏与侧面板

Web 应用的页面骨架：左边是[侧边栏](sidebar.md)，中间是内容区（顶栏 + 对话栏 + 底部的 [Composer](composer.md)），右边可以并排打开侧面板（终端、预览、改动、文件）。macOS 和 iPadOS 上这些由系统的 `NavigationSplitView`、`.toolbar` 和 `.inspector` 提供，带系统玻璃，不用自己画。

**需要提供**：页面标题（可以点开切换或重命名）、顶栏右侧的工具按钮（图标、无障碍标签、是否打开）；侧面板的标签列表和当前标签。

## 尺寸

<!-- tokens:toolbar -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `toolbar-title-size` | 15 | 17 | 15 | 顶栏标题字号（常规字重）。 |
| `panel-tab-height` | 28 | 36 | 32 | 侧面板标签头里每个标签的高度。 |
<!-- /tokens -->

- **顶栏**：高 `toolbar-height`，`canvas` 底，不透明，底部一条 1px `line`，吸顶（`z-sticky`）。左边是标题（`toolbar-title-size`、常规字重、`ink`，后面一个小箭头，点开是菜单）；右边是一排[图标按钮](button.md)，间隔 2，打开状态的按钮用 `fill-selected` 底。
- **内容区**：对话栏宽度不超过 `content-max`，左右至少留 `page-margin` + `space-3`；Composer 左右留 `page-margin`。
- **侧面板**：左边一条 1px `line`，`canvas` 底，默认占内容区的 40%，可以拖动。顶部是标签头，和顶栏同高、底部同样一条线；标签高 `panel-tab-height`，当前标签 `fill-selected` 底、`ink` 字，其他 `ink-secondary`；最右边是关闭、放大按钮。
- 窄于 `breakpoint-md`（960）时侧面板改成覆盖在内容上的[抽屉](sheet.md)；窄于 `breakpoint-sm`（760）时侧边栏也收起成抽屉。

## Web

```css
.dn-app { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; height: 100dvh; background: var(--canvas); color: var(--ink); }
.dn-app-main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.dn-app-content { flex: 1; min-height: 0; overflow: auto; scrollbar-gutter: stable both-edges; padding: var(--space-6) calc(var(--page-margin) + var(--space-3)); }

.dn-toolbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: var(--toolbar-height);
  padding: 0 var(--space-2) 0 var(--space-3);
  border-bottom: var(--stroke-line) solid var(--line);
  background: var(--canvas);
}
.dn-toolbar-title {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  min-width: 0;
  height: var(--button-height-md);
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--button-radius);
  background: transparent;
  color: var(--ink);
  font: var(--weight-regular) var(--toolbar-title-size)/1 var(--font-sans);
  cursor: pointer;
}
.dn-toolbar-title span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dn-toolbar-title .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); color: var(--ink-secondary); }
@media (hover: hover) { .dn-toolbar-title:hover { background: var(--fill-hover); } }
.dn-toolbar-title:active { background: var(--fill-selected); }
.dn-toolbar-actions { display: flex; align-items: center; gap: 2px; margin-left: auto; }
.dn-toolbar .dn-icon-button[aria-pressed="true"], .dn-panel-tabs .dn-icon-button[aria-pressed="true"] { color: var(--ink); }
.dn-toolbar .dn-icon-button[aria-pressed="true"]::after, .dn-panel-tabs .dn-icon-button[aria-pressed="true"]::after { background-color: var(--fill-selected); }

.dn-panel { display: flex; flex-direction: column; min-width: 0; min-height: 0; border-left: var(--stroke-line) solid var(--line); background: var(--canvas); }
.dn-panel-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  height: var(--toolbar-height);
  padding: 0 var(--space-2);
  border-bottom: var(--stroke-line) solid var(--line);
}
.dn-panel-tabs [role="tab"] {
  height: var(--panel-tab-height);
  padding: 0 var(--space-3);
  border: 0;
  border-radius: var(--button-radius);
  background: transparent;
  color: var(--ink-secondary);
  font: var(--weight-regular) var(--type-callout-size)/1 var(--font-sans);
  white-space: nowrap;
  cursor: pointer;
}
@media (hover: hover) { .dn-panel-tabs [role="tab"]:hover { color: var(--ink); } }
.dn-panel-tabs [role="tab"][aria-selected="true"] { background: var(--fill-selected); color: var(--ink); }
.dn-panel-tabs .dn-panel-actions { display: flex; gap: 2px; margin-left: auto; }
.dn-panel-body { flex: 1; min-height: 0; overflow: auto; padding: var(--space-3) var(--space-4); font: var(--type-code); color: var(--ink-secondary); }
```

```html
<div class="dn-app dn-app-demo">
  <div class="dn-app-main">
    <header class="dn-toolbar">
      <button class="dn-toolbar-title" type="button"><span>Deernova UI 风格指南优化</span><svg class="dn-icon" aria-hidden="true"><use href="#dn-chevron-down"/></svg></button>
      <div class="dn-toolbar-actions">
        <button class="dn-icon-button" type="button" aria-label="任务" aria-pressed="false"><svg class="dn-icon" aria-hidden="true"><use href="#dn-document"/></svg></button>
        <button class="dn-icon-button" type="button" aria-label="终端" aria-pressed="true"><svg class="dn-icon" aria-hidden="true"><use href="#dn-terminal"/></svg></button>
        <button class="dn-icon-button" type="button" aria-label="改动" aria-pressed="false"><svg class="dn-icon" aria-hidden="true"><use href="#dn-changes"/></svg></button>
        <button class="dn-icon-button" type="button" aria-label="更多"><svg class="dn-icon" aria-hidden="true"><use href="#dn-more"/></svg></button>
      </div>
    </header>
    <div class="dn-app-content"><div class="dn-message-assistant">内容区：对话、卡片和任务清单在这里滚动，顶栏保持不动。</div></div>
  </div>
  <aside class="dn-panel" aria-label="侧面板">
    <div class="dn-panel-tabs" role="tablist">
      <button type="button" role="tab" aria-selected="true">终端</button>
      <button type="button" role="tab" aria-selected="false">预览</button>
      <div class="dn-panel-actions">
        <button class="dn-icon-button" type="button" aria-label="新建标签"><svg class="dn-icon" aria-hidden="true"><use href="#dn-plus"/></svg></button>
        <button class="dn-icon-button" type="button" aria-label="关闭面板"><svg class="dn-icon" aria-hidden="true"><use href="#dn-close"/></svg></button>
      </div>
    </div>
    <div class="dn-panel-body">$ npm run dev<br>ready in 412 ms</div>
  </aside>
</div>
```

## SwiftUI

macOS 和 iPadOS 用系统结构，顶栏和侧面板都是系统玻璃：

```swift
NavigationSplitView {
    SidebarView()
} detail: {
    ThreadView()
        .navigationTitle(chat.title)
        .toolbarTitleMenu { RenameButton(); Button("复制链接") { … } }
        .toolbar {
            ToolbarItemGroup {
                Toggle("终端", systemImage: "terminal", isOn: $showsTerminal)
                Button("更多", systemImage: "ellipsis") { … }
            }
        }
        .inspector(isPresented: $showsTerminal) { TerminalPanel() }   // 侧面板
}
```

## 不要

- 在 Web 应用的顶栏和侧面板上用玻璃或阴影（用不透明底加 1px 线）。
- 在 SwiftUI 端自己画工具栏、给系统工具栏加实色背景。
- 顶栏标题用粗体或衬线；工具按钮超过 7 个（收进「更多」）。
