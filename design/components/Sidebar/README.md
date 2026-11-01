# Sidebar

macOS 应用的主导航：顶部放全局操作，下面按分组列出各个位置。

**需要提供**：分组（标题可选）、每一项的 SF Symbol 和名称、可选的计数或快捷键、绑定的选中项。

**规格**

- 宽度 `sidebar-mac`（220），用户可以拖动调整。macOS 26 上侧边栏是悬浮的玻璃面板，由 `NavigationSplitView` 自动提供；预览里用 `surface-sunken` 模拟。
- 每项高 `row-mac`（26），`radius-sm`，左右内边距 `space-2`，图标 14pt、颜色 `ink-secondary`，文字 13pt `ink`。
- 悬停时底色 `fill-hover`。选中时底色 `fill-selected`、文字中粗、图标变 `ink`。选中块不用黑色填满，保持安静。
- 分组标题 11pt 半粗 `ink-tertiary`，上方留 `space-3`、下方留 `space-1`。
- 计数和快捷键放在右侧，11pt `ink-tertiary`，用等宽数字。
- 名称太长时在末尾截断，悬停时显示完整内容。

```swift
NavigationSplitView {
    List(selection: $selection) {
        Section("资料库") {
            Label("全部笔记", systemImage: "doc.text").badge(128).tag(Item.all)
            Label("收藏", systemImage: "star").badge(9).tag(Item.favorites)
        }
        Section("最近") {
            ForEach(recent) { chat in
                Label(chat.title, systemImage: "bubble.left").tag(Item.chat(chat.id))
            }
        }
    }
    .navigationSplitViewColumnWidth(min: 180, ideal: 220, max: 300)
} detail: {
    DetailView(selection: selection)
}
.tint(.brandAccent)
```

**不要**：给侧边栏加实色背景（会盖掉系统玻璃）；一级导航超过两层；用彩色图标区分每一项（图标一律灰色）。
