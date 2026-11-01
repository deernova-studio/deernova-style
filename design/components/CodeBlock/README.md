# CodeBlock

展示代码、命令或结构化数据，带语言标签和复制按钮。

**需要提供**：代码文本、语言名称；可选的文件名（替代语言名显示在表头）。

**规格**

- `surface-sunken` 底、`line` 细线描边、`radius-md`。表头高 28pt，左边是语言名或文件名（11pt 等宽、`ink-tertiary`），右边是一个小号文字按钮「复制」；点击后显示「已复制」1.5 秒。
- 代码字体 `code-mac` 或 `code-ios`，内边距上下 `space-2`、左右 `space-3`，过长时横向滚动，不自动换行。
- 语法高亮只用灰阶：关键字 `ink` 加粗，字符串 `ink-secondary`，注释 `ink-tertiary` 加斜体，其余 `ink`。这些颜色在 `surface-sunken` 上都不低于 4.5:1。

```swift
VStack(alignment: .leading, spacing: 0) {
    HStack {
        Text(language).font(.caption.monospaced()).foregroundStyle(.inkTertiary)
        Spacer()
        Button(copied ? "已复制" : "复制", systemImage: copied ? "checkmark" : "doc.on.doc") { copy() }
            .buttonStyle(.borderless).controlSize(.small)
    }
    .padding(.horizontal, 12).frame(height: 28)
    Divider()
    ScrollView(.horizontal) {
        Text(highlighted)                 // 用 AttributedString 按上面的颜色着色
            .font(.system(.callout, design: .monospaced))
            .textSelection(.enabled)
            .padding(.vertical, 8).padding(.horizontal, 12)
    }
}
.background(.surfaceSunken, in: .rect(cornerRadius: 8))
.overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(.line, lineWidth: 1 / displayScale))
```

**不要**：用彩色的编辑器配色主题（和黑白灰的整体风格冲突）；给代码块加阴影；自动换行打乱缩进。
