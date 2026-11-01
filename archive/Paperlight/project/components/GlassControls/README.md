# GlassControls

浮在内容之上的玻璃操作层：工具栏按钮组、标签栏、浮动操作按钮。

**什么时候用**：用户在浏览内容时随时要用到的操作，比如新建、搜索、切换页面、分享。内容本身永远不放在玻璃上。

**需要提供**：每个按钮的 SF Symbol 和无障碍标签（`accessibilityLabel`）、点击动作；如果是标签栏，还要提供当前选中项。

**规格**

- 单个玻璃按钮：圆形，`control-ios`（44）。
- 按钮组：胶囊形，内部按钮 36pt，间距 2pt。相邻的玻璃元素放进同一个 `GlassEffectContainer`，间距 `space-3`。
- 选中项：图标从 `ink-secondary` 变成 `ink`，底色 `fill-selected`。
- 实色玻璃（`accent` 底、`on-accent` 图标，也就是黑底白图标）一屏只用一次，留给主操作，比如「新建」。

```swift
// 标准标签栏与工具栏，系统自动渲染为玻璃
TabView {
    Tab("笔记", systemImage: "doc.text") { NotesView() }
    Tab("收藏", systemImage: "star") { FavoritesView() }
    Tab(role: .search) { SearchView() }      // 搜索单独成为右侧的圆形玻璃按钮
}
.tabBarMinimizeBehavior(.onScrollDown)
.tint(.brandAccent)

// 自定义浮动按钮
GlassEffectContainer(spacing: 12) {
    HStack(spacing: 12) {
        Button("搜索", systemImage: "magnifyingglass") { search() }
            .buttonStyle(.glass)
        Button("新建", systemImage: "plus") { create() }
            .buttonStyle(.glassProminent)
    }
    .labelStyle(.iconOnly)
}

// 完全自定义形状时
Image(systemName: "mic")
    .frame(width: 44, height: 44)
    .glassEffect(.regular.interactive(), in: .circle)
```

**不要**：在玻璃上放段落文字或列表；玻璃叠玻璃；给工具栏加实色背景挡住滚动边缘效果；同一屏出现两个实色玻璃。
