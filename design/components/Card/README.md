# Card

卡片把一条内容的摘要装进一个可以点开的块里，用于网格和看板。

**需要提供**：标题、一到两行摘要、元信息（时间、分类、状态标签），点击后打开详情。

**规格**

- `surface` 底、`stroke-hairline` 宽的 `line` 描边，不加阴影。Mac 用 `radius-md`，iOS 用 `radius-lg`。Mac 内边距 `space-3`，iOS 内边距 14pt × `space-4`，内部间距 `space-1`。
- 标题用衬线 15pt 半粗（Mac）或 17pt（iOS）；摘要用 `mac-callout` 或 `ios-footnote`、`ink-secondary`，最多 3 行；元信息 11pt `ink-tertiary`。
- 悬停时描边加深为 `line-control`。选中时描边变成 1pt 的 `ink`。
- 网格间距 `space-2`（Mac）或 `space-3`（iOS）；每张卡片高度由内容决定，同一行顶部对齐。

```swift
VStack(alignment: .leading, spacing: 4) {
    Text(note.title).font(.system(.headline, design: .serif))
    Text(note.summary).font(.callout).foregroundStyle(.inkSecondary).lineLimit(3)
    Text(note.date, format: .relative(presentation: .named))
        .font(.caption).foregroundStyle(.inkTertiary)
}
.padding(12)
.frame(maxWidth: .infinity, alignment: .leading)
.background(.surface, in: .rect(cornerRadius: 8))
.overlay(
    RoundedRectangle(cornerRadius: 8)
        .strokeBorder(isSelected ? .ink : .line,
                      lineWidth: isSelected ? 1 : 1 / displayScale)
)
```

**不要**：给卡片加阴影或玻璃效果；在卡片左侧加一条彩色竖条；卡片里套卡片；一张卡片里放多个主按钮。
