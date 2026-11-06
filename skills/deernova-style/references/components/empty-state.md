# 空状态

列表、搜索结果或整个页面没有内容时显示：说明现在是什么状态，再给出下一步。

**需要提供**：图标、标题（描述状态）、一句正文（告诉用户怎么开始），以及最多一个主操作和一个次操作。

## 尺寸

<!-- tokens:empty-state -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `empty-title-size` | 24 | 20 | 32 | 空状态标题（衬线）字号。 |
| `empty-icon-size` | 32 | 36 | 40 | 空状态图标的边长。 |
<!-- /tokens -->

- 在可用区域里视觉居中：水平居中，垂直方向略高于正中（上下留白约 2 : 3），见 [布局与对齐](../foundations/layout.md)。图标 `empty-icon-size`、细线、`ink-tertiary`；标题用衬线 `empty-title-size`、半粗；正文 `type-body`、`ink-secondary`，最大宽度 320。
- 按钮用[大号](button.md)。
- 搜索没有结果时不放按钮，标题写成「没有找到“关键词”」，正文给出修改建议。

## Web

```css
.dn-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); padding: var(--space-6) var(--space-5); text-align: center; }
.dn-empty > .dn-icon { width: var(--empty-icon-size); height: var(--empty-icon-size); color: var(--ink-tertiary); stroke-width: 1.4; }
.dn-empty-title { margin: var(--space-2) 0 0; color: var(--ink); font: var(--weight-semibold) var(--empty-title-size)/1.25 var(--font-serif); letter-spacing: var(--type-display-tracking); }
.dn-empty-body { max-width: 320px; margin: 0 0 var(--space-3); color: var(--ink-secondary); font: var(--type-body); }
.dn-empty-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--gap-stack); }
```

```html
<div class="dn-empty">
  <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>
  <h3 class="dn-empty-title">还没有笔记</h3>
  <p class="dn-empty-body">写下第一条想法，它会同步到你所有的设备。</p>
  <div class="dn-empty-actions">
    <button class="dn-button is-primary is-lg" type="button">新建笔记</button>
    <button class="dn-button is-lg" type="button">从文件导入</button>
  </div>
</div>
```

## SwiftUI

```swift
ContentUnavailableView {
    Label("还没有笔记", systemImage: "doc.text")
        .font(.system(size: Deernova.emptyTitleSize, weight: .semibold, design: .serif))
} description: {
    Text("写下第一条想法，它会同步到你所有的设备。")
} actions: {
    Button("新建笔记") { create() }.buttonStyle(.borderedProminent).controlSize(.large)
    Button("从文件导入") { importFile() }.controlSize(.large)
}

// 搜索没有结果
ContentUnavailableView.search(text: query)
```

## 不要

- 用插画或吉祥物填满空白。
- 标题写「空空如也」这种玩笑话。
- 出现三个以上的按钮。
