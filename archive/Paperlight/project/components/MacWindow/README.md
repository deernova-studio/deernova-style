# MacWindow

Mac 应用窗口的标准结构：左边是悬浮的玻璃侧边栏，右边内容区的上方浮着玻璃工具栏，下方浮着 Composer。

**结构**

- 窗口底色 `canvas`。侧边栏是 `NavigationSplitView` 的 sidebar 列，系统会渲染成悬浮的玻璃面板。
- 工具栏用 `.toolbar` 声明，标题用 `mac-headline`；右侧的按钮组由系统渲染成玻璃胶囊。内容从工具栏下面滚过去。
- 内容区居中，阅读栏宽不超过 `content-max`，左右边距 `space-4`。
- 底部的 Composer 悬浮在内容之上，它承载输入的内容，所以是纸面，不是玻璃。用 `.safeAreaInset(edge: .bottom)` 放置，让内容可以滚到它的上方。

```swift
NavigationSplitView {
    SidebarView()
} detail: {
    ScrollView { ThreadView().frame(maxWidth: 680) }
        .safeAreaInset(edge: .bottom) { Composer().padding(16) }
        .navigationTitle(chat.title)
        .toolbar {
            ToolbarItemGroup {
                ShareLink(item: chat.url)
                Menu("更多", systemImage: "ellipsis") { … }
            }
        }
}
.background(.canvas)
```
