# PhoneScreen

iPhone 上的两种典型页面：一个列表页，一个对话页。展示纸面和玻璃在手机上怎么分层。

**列表页**

- 衬线大标题（`ios-large-title`），内容是 `radius-lg` 的卡片，左右边距 `space-4`，卡片之间 `space-2`。
- 底部是玻璃标签栏，搜索单独成为右侧的圆形玻璃按钮（`Tab(role: .search)`）。向下滚动时标签栏收起。

**对话页**

- 顶部的返回和更多按钮是系统导航栏提供的玻璃圆形按钮，标题用 17pt 半粗。
- 对话内容：AI 回答用 `ios-prose`，用户消息用 `ios-callout`。
- 底部的 Composer 收成单行胶囊（`radius-xl`），用 `.safeAreaInset(edge: .bottom)` 悬浮在内容上方；输入多行时向上增长。

```swift
NavigationStack {
    ScrollView { ThreadView().padding(.horizontal, 16) }
        .safeAreaInset(edge: .bottom) { Composer().padding(.horizontal, 12) }
        .navigationTitle("周报整理")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar { ToolbarItem { Menu("更多", systemImage: "ellipsis") { … } } }
}
.background(.canvas)
```
