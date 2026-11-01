# Sheet

从底部弹出的面板，用于一个短小、独立的任务：确认购买、编辑一个字段、选择分享方式。

**需要提供**：标题、一两句说明、内容（短表单或选项）、主操作和取消操作，以及要支持的高度档位。

**规格**

- iOS 26 上，系统会把中等高度的弹窗渲染成悬浮的玻璃面板，四周留出间距；拉到全高后变成不透明。直接使用系统样式，不要自己画背景。
- 顶部拖拽条 36×5pt，`line-control` 色。
- 标题用 `ios-title`（衬线），说明用 `ios-callout` `ink-secondary`，下方留 `space-4`。
- 主操作是通栏 46pt 胶囊主按钮（`control-ios-lg`），下面是同尺寸的文字按钮「暂不需要」，两者间距 `space-1`。
- 内容超过一屏，或需要长时间阅读时，改成全高弹窗或推入新页面，背景用 `canvas`。
- Mac 上对应的是附着在窗口上的 sheet 和系统 Alert，同样直接使用系统样式。

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

**不要**：在弹窗里再弹一个弹窗；把长篇文章放进玻璃弹窗；没有取消方式；把价格之类的关键信息藏在小字里。
