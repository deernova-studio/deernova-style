# 侧边栏

应用的主导航。由上到下：带图标的全局入口（新建、搜索、定时任务……）、按项目分组的会话（组标题可以折叠，会话名不带图标）、底部的账号和设置。macOS、iPadOS 和桌面 Web 应用都用它；iPhone 和窄屏 Web 收起成导航栈或抽屉。

**需要提供**：全局入口（图标、名称、可选的快捷键）；分组（名称、是否展开）和每组的条目；当前选中项；账号信息和设置入口。

## 尺寸

<!-- tokens:sidebar -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `row-height` | 32 | 44 | 40 | 侧边栏项、列表行的最小高度。 |
| `row-padding-x` | 10 | 16 | 12 | 行的左右内边距；分隔线从这里开始。 |
| `row-radius` | 8 | 10 | 8 | 悬停和选中底色的圆角。 |
| `row-gap` | 2 | 0 | 2 | 侧边栏项之间的间隔。触屏上的列表用分隔线，不留间隔。 |
<!-- /tokens -->

- **macOS / iPadOS**：用系统的 `NavigationSplitView` 侧边栏，它是悬浮的玻璃面板；行高、字号交给系统，不要加实色背景。
- **Web**：宽 `sidebar-width`，`surface` 底（比内容区亮一层），右边一条 1px `line`；用户可以拖动调整宽度。
- 每项高 `row-height`，项与项之间 `row-gap`，左右内边距 `row-padding-x`，选中块离侧边栏边缘 `space-2`，圆角 `row-radius`。
- 全局入口：图标 `icon-size-md`、`ink-secondary`，文字 `type-body`、`ink`。
- 分组标题：`footnote` 字号、**常规字重**、`ink-tertiary`，后面一个小箭头，点击折叠。组与组之间 `space-4`。
- 会话名：`callout` 字号、`ink`，不带图标，末尾截断，悬停时显示完整名称。
- 悬停 `fill-hover`；选中 `fill-selected`，字重不变。选中块不用黑色填满，保持安静。
- 底部：头像、账号名（`callout`）、设置齿轮，上方一条 1px `line`。
- 计数和快捷键放在右侧，`caption` 字号、`ink-tertiary`，用等宽数字。

## Web

```css
.dn-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: var(--sidebar-width);
  max-width: 100%;
  padding: var(--space-2);
  border-right: var(--stroke-line) solid var(--line);
  background: var(--surface);
}
.dn-sidebar-section, .dn-sidebar-group { display: flex; flex-direction: column; gap: var(--row-gap); }
.dn-sidebar-group { interpolate-size: allow-keywords; }
.dn-sidebar-group::details-content { display: flex; flex-direction: column; gap: var(--row-gap); block-size: 0; overflow: clip; transition: block-size var(--duration-base) var(--ease-standard), content-visibility var(--duration-base) allow-discrete; }
.dn-sidebar-group[open]::details-content { block-size: auto; }
@media (prefers-reduced-motion: reduce) { .dn-sidebar-group::details-content { transition: none; } }
.dn-sidebar-heading {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  min-height: var(--row-height);
  padding: 0 var(--row-padding-x);
  border-radius: var(--row-radius);
  color: var(--ink-tertiary);
  font: var(--type-footnote);
  list-style: none;
  cursor: pointer;
}
.dn-sidebar-heading::-webkit-details-marker { display: none; }
.dn-sidebar-heading .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); transition: transform var(--duration-base) var(--ease-standard); }
.dn-sidebar-group:not([open]) > .dn-sidebar-heading .dn-icon { transform: rotate(-90deg); }
@media (hover: hover) { .dn-sidebar-heading:hover { color: var(--ink-secondary); } }
.dn-sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  min-height: var(--row-height);
  padding: 0 var(--row-padding-x);
  border-radius: var(--row-radius);
  color: var(--ink);
  font: var(--type-body);
  text-decoration: none;
  transition: background-color var(--duration-instant) var(--ease-standard);
}
.dn-sidebar-group .dn-sidebar-item { font: var(--type-callout); }
.dn-sidebar-item .dn-icon { width: var(--icon-size-md); height: var(--icon-size-md); color: var(--ink-secondary); }
@media (hover: hover) { .dn-sidebar-item:hover { background: var(--fill-hover); } }
.dn-sidebar-item:active { background: var(--fill-selected); }
.dn-sidebar-item[aria-current="page"] { background: var(--fill-selected); }
.dn-sidebar-item:focus-visible { outline: none; box-shadow: none; background: var(--fill-selected); text-decoration: underline; text-underline-offset: 3px; }
.dn-sidebar-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dn-sidebar-count { color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); font-variant-numeric: tabular-nums; }
.dn-sidebar-footer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: auto;
  padding: var(--space-2) var(--row-padding-x) 0;
  border-top: var(--stroke-line) solid var(--line);
  font: var(--type-callout);
}
.dn-avatar { display: grid; place-items: center; flex: none; width: var(--button-height-sm); height: var(--button-height-sm); border-radius: var(--radius-full); background: var(--fill-selected); color: var(--ink); font: var(--weight-medium) var(--type-caption-size)/1 var(--font-sans); }
```

```html
<nav class="dn-sidebar" aria-label="侧边栏">
  <div class="dn-sidebar-section">
    <a class="dn-sidebar-item" href="#"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span class="dn-sidebar-label">新建</span><span class="dn-sidebar-count">⌘N</span></a>
    <a class="dn-sidebar-item" href="#"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg><span class="dn-sidebar-label">搜索</span></a>
    <a class="dn-sidebar-item" href="#"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="dn-sidebar-label">定时任务</span></a>
  </div>
  <details class="dn-sidebar-group" open>
    <summary class="dn-sidebar-heading">deernova-style<svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary>
    <a class="dn-sidebar-item" href="#" aria-current="page"><span class="dn-sidebar-label">Deernova UI 风格指南优化</span></a>
    <a class="dn-sidebar-item" href="#"><span class="dn-sidebar-label">首页麋鹿的散步动画</span></a>
  </details>
  <details class="dn-sidebar-group" open>
    <summary class="dn-sidebar-heading">dumbo<svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary>
    <a class="dn-sidebar-item" href="#"><span class="dn-sidebar-label">沙箱个人助理实现审查</span></a>
  </details>
  <div class="dn-sidebar-footer"><span class="dn-avatar" aria-hidden="true">林</span><span class="dn-sidebar-label">林一 · Pro</span><button class="dn-icon-button" type="button" aria-label="设置"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg></button></div>
</nav>
```

## SwiftUI

系统侧边栏自带玻璃和系统行高，直接用；分组用可折叠的 `Section`。

```swift
NavigationSplitView {
    List(selection: $selection) {
        Label("新建", systemImage: "plus").tag(Item.new)
        Label("搜索", systemImage: "magnifyingglass").tag(Item.search)
        ForEach(projects) { project in
            Section(project.name, isExpanded: $expanded[project.id]) {
                ForEach(project.chats) { chat in
                    Text(chat.title).lineLimit(1).tag(Item.chat(chat.id))
                }
            }
        }
    }
    .navigationSplitViewColumnWidth(min: 220, ideal: Deernova.sidebarWidth, max: 360)
    .safeAreaInset(edge: .bottom) { AccountRow() }    // 头像、账号名、设置
} detail: {
    DetailView(selection: selection)
}
.tint(.brandAccent)
```

## 不要

- 在 SwiftUI 端给侧边栏加实色背景盖掉系统玻璃；在 Web 上给侧边栏加模糊效果。
- 分组标题用粗体或大写字母；会话名前加图标。
- 一级导航超过两层；用彩色图标区分每一项（图标一律灰色）。
