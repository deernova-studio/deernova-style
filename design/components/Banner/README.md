# Banner

页面内的提示条，告诉用户一件需要知道的事，必要时附带一个解决动作。轻提示（Toast）是它的短暂版本。

**需要提供**：语气（中性 / success / warning / danger）、标题（一句话说明状态）、正文（后果或解决办法）、可选的一个动作按钮；能关闭的横幅还要提供关闭动作。

**规格**

- 中性横幅：`surface-raised` 底、`line` 描边、`ink-secondary` 图标。有语气的横幅：对应的 `-soft` 底、无描边、图标用语气色。文字始终是 `ink` 和 `ink-secondary`。
- `radius-md`，内边距上下 `space-2`、左右 `space-3`，图标 16pt；标题 13pt 半粗，正文 12pt。图标统一用 README「图标」一节里的状态符号。
- 动作按钮用小号次按钮，放在右侧，一个横幅最多一个。
- 轻提示：底部居中的玻璃胶囊，高 40pt，2 秒后自动消失，只用来确认刚刚完成的操作（「已复制」「已保存」），文字用完成态，不放按钮。

```swift
HStack(alignment: .top, spacing: 10) {
    Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(.warning)
    VStack(alignment: .leading, spacing: 2) {
        Text("本月 AI 次数还剩 10%").font(.headline)
        Text("用完后可以继续写笔记，AI 功能会在 11 月 1 日恢复。")
            .foregroundStyle(.inkSecondary)
    }
}
.padding(.vertical, 8).padding(.horizontal, 12)
.frame(maxWidth: .infinity, alignment: .leading)
.background(.warningSoft, in: .rect(cornerRadius: 8))

// 轻提示
Label("已复制到剪贴板", systemImage: "checkmark.circle.fill")
    .padding(.horizontal, 16).frame(height: 40)
    .glassEffect(in: .capsule)
```

**不要**：一个页面同时出现多个横幅；用横幅打广告；错误信息只写「出错了」；轻提示里放需要用户处理的事情（那应该用横幅或弹窗）。
