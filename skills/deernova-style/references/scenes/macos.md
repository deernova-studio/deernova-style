# macOS

Mac 应用分两部分处理：

- **系统的部分**（侧边栏、工具栏、菜单、设置窗口、表单、弹窗）：直接用系统控件和系统尺寸，自带 Liquid Glass。不要盖掉玻璃，也不要硬改成 Web 的尺寸。
- **自己画的内容区**（对话、卡片、Composer、任务清单）：用**桌面**密度（`desktop`），和 Web 应用一致：正文 15/24、卡片圆角 12、Composer 单行 44、按钮 28。

SwiftUI 的通用写法见 [SwiftUI 共用](swiftui.md)。

## 窗口骨架

标准结构：左边是悬浮的玻璃侧边栏，右边内容区的上方浮着玻璃工具栏，下方浮着 Composer，需要时右边打开 inspector 侧面板。效果见 `assets/screens/mac-window-light.png` 和 `mac-window-dark.png`：系统的部分按 Apple HIG 里 macOS 26 的比例画，内容区用 Deernova 的组件。

- 窗口底色 `canvas`。侧边栏是 `NavigationSplitView` 的 sidebar 列，系统会渲染成悬浮的玻璃面板，默认宽度参考 `sidebar-width`（288）。
- 工具栏用 `.toolbar` 声明，标题用 `headline`；右侧的按钮组由系统渲染成玻璃胶囊。内容从工具栏下面滚过去。
- 内容区居中，阅读栏宽不超过 `content-max`，左右边距 `page-margin`。
- 底部的 Composer 悬浮在内容之上，它承载输入的内容，所以是纸面，不是玻璃。用 `.safeAreaInset(edge: .bottom)` 放置，让内容可以滚到它的上方。

```swift
NavigationSplitView {
    SidebarView()
        .navigationSplitViewColumnWidth(min: Deernova.sidebarWidthMin, ideal: Deernova.sidebarWidth, max: Deernova.sidebarWidthMax)
} detail: {
    ScrollView { ThreadView().frame(maxWidth: Deernova.contentMax) }
        .safeAreaInset(edge: .bottom) { Composer().padding(Deernova.pageMargin) }
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

## 系统部分长什么样（macOS 26）

Apple 没有公布工具栏按钮的点数，大小由系统决定，代码里不要自己设。下面是按 Apple HIG「Toolbars」页里 macOS 26 备忘录截图量出的比例（以红绿灯直径 12、间距 20 为尺子），用来画设计稿和检查实现：

- 工具栏按钮约 34 × 34，图标约 16；竖直中心和红绿灯在同一条线上，离窗口顶边约 22。
- 同类按钮共用一块玻璃胶囊（系统按控件类型自动分组），胶囊和按钮一样高，没有额外的内边距；一个工具栏最多三组。
- 符号不加外圈（不用 `circle` 版本的 SF Symbol），悬停和选中状态由系统画。
- 只有一个主操作用 `.prominent` 样式，放在最右边。
- 窗口圆角约 22；悬浮的玻璃侧边栏和窗口同心（内缩 8，圆角约 14）。
- 标题不超过 15 个字，可以带一行灰色的副标题；不要用应用名当标题。

## 尺寸

- 系统控件：用系统按钮加 `.controlSize(…)`、系统 `List`，尺寸交给系统。
- 自己画的内容区：用 `Deernova.*`（macOS 上是桌面密度）：按钮 28（`buttonHeightMd`）、卡片圆角 12、内边距 12 × 16、Composer 单行 44、正文 `.deernovaBody`（15）。
- 图标按钮至少 24×24（`hit-min`）。

## 交互

- Return 发送、Shift-Return 换行；常用操作配键盘快捷键（`.keyboardShortcut`），并显示在菜单里。
- 悬停才显示的次要操作（消息下的复制、重新生成），键盘聚焦时也要显示。
- 设置窗口用 `Settings` 场景加 `Form` 和 `.formStyle(.grouped)`。
- 右键菜单（`.contextMenu`）里的操作和工具栏、菜单栏一致。

## 不要

- 把 iOS 的 36pt 按钮、44pt 列表行搬到 Mac 上；或者为了和 Web 一样，把系统控件改成自绘。
- 给侧边栏或工具栏加实色背景，盖掉系统玻璃。
- 自己画窗口标题栏和红绿灯按钮。
