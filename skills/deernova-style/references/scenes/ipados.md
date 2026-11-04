# iPadOS

iPad 应用和 iPhone 一样用**触控**密度（`touch`），导航结构用系统的，自带 Liquid Glass：手指仍然是主要的输入方式，控件和点击区域与 iOS 相同。不同的是布局：iPad 有侧边栏和分栏，也经常接触控板和键盘。SwiftUI 的通用写法见 [SwiftUI 共用](swiftui.md)。

这是首版规则，还没有配套的截图，落地后要在真机上检查。

## 布局

- 全屏和大窗口时用 `NavigationSplitView`：侧边栏（`sidebar-width`，320）加内容区，必要时再加一栏详情。侧边栏是系统的玻璃面板。
- 窗口变窄（台前调度、分屏）时，`horizontalSizeClass` 变成 `.compact`，按 iPhone 的规则排版：侧边栏收起，导航改成栈。不要按设备型号判断。
- 内容区的阅读栏宽不超过 `content-max`，在宽屏上居中，两侧留白；不要把文字拉满整个横屏。
- 卡片网格按可用宽度自动增减列数（`LazyVGrid` 加 `.adaptive(minimum:)`），间距 `card-gap`。
- 弹窗用 `.presentationSizing(.form)` 或 `.page`，不要在大屏上弹出撑满全屏的底部弹窗。

```swift
NavigationSplitView {
    SidebarView()
        .navigationSplitViewColumnWidth(min: 260, ideal: Deernova.sidebarWidth, max: 400)
} detail: {
    ScrollView { ThreadView().frame(maxWidth: Deernova.contentMax) }
        .safeAreaInset(edge: .bottom) { Composer().frame(maxWidth: Deernova.contentMax).padding(Deernova.pageMargin) }
}
.background(.canvas)
```

## 尺寸

- 和 iOS 相同：按钮可见 30 / 36 / 46，点击区域 44，列表行和侧边栏项 44，正文 17pt（动态字体）。
- 侧边栏项沿用 [侧边栏](../components/sidebar.md) 的样式，触控密度下行高自动变成 44。

## 指针和键盘

- 接触控板时，可点的自定义视图加 `.hoverEffect()`，让指针吸附和高亮跟系统一致。
- 常用操作加 `.keyboardShortcut`，按住 Command 时系统会列出它们。Return 在 Composer 里的行为和 Mac 一致：接了硬件键盘时 Return 发送、Shift-Return 换行。
- 支持拖放（`.draggable`、`.dropDestination`）：文件拖进 Composer 就是添加附件。拖放区用 `line-style-dropzone` 的虚线。
- 右键（双指轻点）出 `.contextMenu`。

## 不要

- 按设备型号写死布局；用尺寸类别和可用宽度。
- 在大屏上把正文拉满整行。
- 把桌面尺寸用在 iPad 上：即使接了触控板，用户也随时会用手指点。
