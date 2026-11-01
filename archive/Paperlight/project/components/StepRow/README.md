# StepRow

一行显示一个执行步骤：做了什么、结果如何、用了多久。点开可以看到细节。用于 AI 的工具调用、导入导出、批量处理这类任务。

**需要提供**：状态（进行中 / 成功 / 失败）、动作名（2–4 个字的动词）、对象摘要（文件名、参数、结果）、耗时或说明；可选的详细内容，点击后展开。

**规格**

- 高 `control-mac`，`radius-sm`，悬停时底色 `fill-hover`。整行默认 `ink-secondary`，让位于正文内容。
- 状态图标 14pt：进行中是 `ink` 色的转圈，成功是 `success` 色，失败是 `danger` 色。失败时摘要要写清楚原因。
- 动作名 12pt 半粗 `ink`；摘要用 11pt 等宽，单行，在末尾截断；右侧耗时 11pt `ink-tertiary`。
- 展开后的详情缩进到和文字对齐，`surface-sunken` 底，`radius-sm`，12pt 等宽。
- 连续 3 步以上全部成功时，合并成一行「完成 5 个步骤」，点击后展开。

```swift
DisclosureGroup(isExpanded: $expanded) {
    Text(step.detail)
        .font(.system(.callout, design: .monospaced))
        .foregroundStyle(.inkSecondary)
        .padding(.vertical, 6).padding(.horizontal, 8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.surfaceSunken, in: .rect(cornerRadius: 6))
} label: {
    HStack(spacing: 7) {
        StatusGlyph(step.status)          // ProgressView / checkmark.circle / xmark.circle
        Text(step.action).fontWeight(.semibold).foregroundStyle(.ink)
        Text(step.summary).font(.callout.monospaced()).lineLimit(1)
        Spacer()
        Text(step.duration).font(.caption).monospacedDigit().foregroundStyle(.inkTertiary)
    }
    .foregroundStyle(.inkSecondary)
}
```

**不要**：把每一步都做成卡片；成功的步骤也用醒目的颜色；把原始日志直接铺在对话里（放进折叠详情）。
