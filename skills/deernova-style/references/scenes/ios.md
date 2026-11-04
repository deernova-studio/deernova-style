# iOS

iPhone 应用用**触控**密度（`touch`）：正文 17pt、点击区域至少 44pt，按钮看起来只有 36pt。SwiftUI 的通用写法见 [SwiftUI 共用](swiftui.md)。

## 页面骨架

两种典型页面：列表页和对话页。效果见 `assets/screens/iphone-screens-light.png` 和 `iphone-screens-dark.png`。

**列表页**

- 衬线大标题（`type-display`，也就是 `.largeTitle` 的衬线版），内容是 `card-radius` 的卡片，左右边距 `page-margin`，卡片之间 `space-2`。
- 底部是玻璃标签栏，搜索单独成为右侧的圆形玻璃按钮（`Tab(role: .search)`）。向下滚动时标签栏收起。

**对话页**

- 顶部的返回和更多按钮是系统导航栏提供的玻璃圆形按钮，标题用 `headline`。
- 对话内容：AI 回答用 `type-body`（`.body`，无衬线），用户消息在 `surface-raised` 气泡里，字号 `message-font-size`。
- 底部的 Composer 收成单行胶囊（`composer-radius`），用 `.safeAreaInset(edge: .bottom)` 悬浮在内容上方；输入多行时向上增长。

```swift
NavigationStack {
    ScrollView { ThreadView().padding(.horizontal, Deernova.pageMargin) }
        .safeAreaInset(edge: .bottom) { Composer().padding(.horizontal, Deernova.space3) }
        .navigationTitle("周报整理")
        .navigationBarTitleDisplayMode(.inline)
}
.background(.canvas)
```

## 系统部分长什么样（iOS 26）

导航栏按钮和标签栏由系统绘制，代码里不要自己设尺寸。下面是按 Apple HIG 里 iOS 26 插图量出的比例（以状态栏「9:41」的字高为尺子，屏幕宽 402），截图 `assets/screens/iphone-screens-*.png` 就是按这个比例画的：

- 顶部的玻璃按钮约 44，圆形；几个同类按钮共用一块胶囊；竖直中心离屏幕顶边约 85。
- 标签栏是悬浮的玻璃胶囊，高约 62，离屏幕左、右、下边各约 25；选中项是填满标签栏高度的胶囊（`fill-selected`），图标约 24、文字约 10。
- 搜索用 `Tab(role: .search)`，是标签栏右边单独的 62 圆形玻璃按钮。
- 底部有标签栏时，内容最后一项要留出标签栏的高度，不要被挡住。

## 尺寸和点击区域

- 按钮的可见高度：小 30、默认 36、通栏 46；点击区域补足到 44（`hit-min`）。按钮尺寸怎么选，见 [按钮](../components/button.md)。三种尺寸放在手机里的样子见 `assets/screens/iphone-button-sizes-light.png`。
- 补点击区域的写法：在 `.buttonStyle()` 之后加 `.padding()`（这时是透明的），再加 `.contentShape(.rect)`。
- 列表行、输入框至少 44（`row-height`、`field-height`）。
- 卡片和分组列表圆角 12，底部弹窗圆角 24。

## 字体

一律用文本样式（`.body`、`.headline`，或生成的 `.deernovaBody`），不要写死 `size:`，否则动态字体不生效。在最大字号下也不截断文字：允许换行，横排放不下就改成竖排（`ViewThatFits`）。

## 交互

- 只能点按钮发送消息；换行键就是换行。
- 操作按钮一直显示，不依赖悬停。
- 可以滑动删除、长按出菜单（`.swipeActions`、`.contextMenu`），但同样的操作要有可见的入口。
- 底部弹窗用 `.presentationDetents`，确认类二选一用 `.confirmationDialog`。

## 不要

- 写死字号让动态字体失效。
- 把 Mac 的 24pt 控件直接搬到触屏上；或者反过来，为了凑 44 把按钮做成 44 高。
- 给导航栏、标签栏加实色背景。
