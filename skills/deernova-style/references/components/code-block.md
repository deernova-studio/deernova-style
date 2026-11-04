# 代码块

展示代码、命令或结构化数据，带语言标签和复制按钮。

**需要提供**：代码文本、语言名称；可选的文件名（替代语言名显示在表头）。

## 尺寸

<!-- tokens:code-block -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `code-header-height` | 32 | 36 | 36 | 代码块表头的高度。 |
<!-- /tokens -->

- `surface-sunken` 底、`line` 细线描边、`radius-md`。表头高 `code-header-height`，左边是语言名或文件名（`caption` 字号、等宽、`ink-tertiary`），右边是一个小号文字按钮「复制」；点击后显示「已复制」1.5 秒，按钮宽度不变。
- 代码用 `type-code`，内边距上下 `space-2`、左右 `space-3`，过长时横向滚动，不自动换行。
- 语法高亮只用灰阶：关键字 `ink` 加粗，字符串 `ink-secondary`，注释 `ink-tertiary` 加斜体，其余 `ink`。这些颜色在 `surface-sunken` 上都不低于 4.5:1。

## Web

```css
.dn-code { overflow: hidden; min-width: 0; border: var(--stroke-line) solid var(--line); border-radius: var(--radius-md); background: var(--surface-sunken); }
.dn-code-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: var(--code-header-height);
  padding: 0 var(--space-1) 0 var(--space-3);
  border-bottom: var(--stroke-line) solid var(--line);
  color: var(--ink-tertiary);
  font: var(--weight-regular) var(--type-caption-size)/1 var(--font-mono);
}
.dn-code-header .dn-button { margin-left: auto; }
.dn-code pre { margin: 0; padding: var(--space-2) var(--space-3); overflow-x: auto; color: var(--ink); font: var(--type-code); }
.dn-code code { font: inherit; }
.dn-code .tk-keyword { color: var(--ink); font-weight: var(--weight-semibold); }
.dn-code .tk-string { color: var(--ink-secondary); }
.dn-code .tk-comment { color: var(--ink-tertiary); font-style: italic; }
```

```html
<div class="dn-code">
  <div class="dn-code-header">swift<button class="dn-button is-plain is-sm" type="button"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>复制</button></div>
  <pre><code><span class="tk-comment">// 统计本周完成的笔记数</span>
<span class="tk-keyword">let</span> done = notes.filter { $0.completedAt &gt;= start }
<span class="tk-keyword">print</span>(<span class="tk-string">"本周完成 \(done.count) 条"</span>)</code></pre>
</div>
```

## SwiftUI

```swift
VStack(alignment: .leading, spacing: 0) {
    HStack {
        Text(language).font(.caption.monospaced()).foregroundStyle(.inkTertiary)
        Spacer()
        Button(copied ? "已复制" : "复制", systemImage: copied ? "checkmark" : "doc.on.doc") { copy() }
            .buttonStyle(.borderless).controlSize(.small)
    }
    .padding(.horizontal, Deernova.space3).frame(height: Deernova.codeHeaderHeight)
    Divider()
    ScrollView(.horizontal) {
        Text(highlighted)                 // 用 AttributedString 按上面的颜色着色
            .font(.deernovaCode)
            .textSelection(.enabled)
            .padding(.vertical, Deernova.space2).padding(.horizontal, Deernova.space3)
    }
}
.background(.surfaceSunken, in: .rect(cornerRadius: Deernova.radiusMd))
.overlay(RoundedRectangle(cornerRadius: Deernova.radiusMd).strokeBorder(.line, lineWidth: 1 / displayScale))
```

## 不要

- 用彩色的编辑器配色主题（和黑白灰的整体风格冲突）。
- 给代码块加阴影。
- 自动换行打乱缩进。
