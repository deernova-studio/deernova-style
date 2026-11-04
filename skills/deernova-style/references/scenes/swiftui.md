# SwiftUI 共用

macOS、iOS 和 iPadOS 共用的 SwiftUI 落地方法。各平台的骨架和尺寸见 [macOS](macos.md)、[iOS](ios.md)、[iPadOS](ipados.md)。

## 系统版本

Deernova 按 iOS 26 / iPadOS 26 / macOS 26 设计，Liquid Glass 相关的 API（`.glassEffect()`、`GlassEffectContainer`、`.buttonStyle(.glass)` 等）从这些版本开始提供。

- 先看项目的部署目标。不要为了用这份规范去提高项目的最低系统版本。
- 部署目标低于 26 时，系统导航栏、工具栏、标签栏会自动使用当时的材质，不用处理；自定义的浮动按钮用 `if #available(iOS 26, macOS 26, *)` 分支，旧系统上退回 `.background(.regularMaterial, in: .capsule)`。
- 这里的示例是设计参考，落地后要在项目的 SDK 下编译，并在真机或模拟器上看效果。

## 接入变量

把 `assets/DeernovaTokens.swift` 加进 App target。它由 `tokens.json` 生成，提供：

- **颜色**：`.canvas`、`.surface`、`.ink`、`.inkSecondary`、`.line`、`.brandAccent`、`.success` 等，跟随浅色和深色外观，可以直接写 `.foregroundStyle(.inkSecondary)`、`.background(.surface, in: …)`。`accent` 命名为 `brandAccent`，避开系统的 `accentColor`。不需要 Asset Catalog。
- **尺寸**：`Deernova.buttonHeightMd`、`Deernova.cardRadius`、`Deernova.composerMinHeight`、`Deernova.pageMargin` 等。macOS 上是 `desktop` 的值（只用于自己画的内容区，系统控件保持系统尺寸），iOS 和 iPadOS 上是 `touch` 的值。
- **字体**：`.deernovaBody`、`.deernovaTitle`、`.deernovaProse` 等。macOS 上是固定字号（正文 15），iOS 上是文本样式，支持动态字体。

项目已经用 Asset Catalog 管理颜色时，也可以按 token 名建 Color Set、分别填入 Any 和 Dark 两套值（见 [设计变量](../tokens.md)），再写同名的扩展。`glass-fill`、`glass-stroke` 只用于网页，App 里不要建。

在 App 入口统一着色，系统控件会自动跟随（按钮、选中态在浅色主题变黑，在深色主题变白）。开关单独着色：

```swift
WindowGroup {
    RootView()
        .tint(.brandAccent)
}

Toggle("iCloud 同步", isOn: $sync)
    .tint(.success)
```

窗口和页面底色用 `.background(.canvas)`；系统列表要先 `.scrollContentBackground(.hidden)`，底色才会生效。

## 字体

| 角色 | macOS | iOS / iPadOS |
| --- | --- | --- |
| `display` | `.system(size: 26, weight: .semibold, design: .serif)` | `.system(.largeTitle, design: .serif).weight(.semibold)` |
| `title` | `.system(size: 18, weight: .semibold, design: .serif)` | `.system(.title3, design: .serif).weight(.semibold)` |
| `headline` | `.system(size: 15, weight: .semibold)` | `.headline` |
| `body`（界面正文、AI 回答） | `.system(size: 15)` 加 `.lineSpacing(6)` | `.body` |
| `prose`（文章类长文） | `.system(size: 16, design: .serif)` | `.system(.body, design: .serif)` 加 `.lineSpacing(6)` |
| `callout` / `footnote` / `caption` | `.system(size: 14)` / `13` / `12` | `.callout` / `.footnote` / `.caption` |
| `code` | `.system(size: 13, design: .monospaced)` | `.system(.footnote, design: .monospaced)` |

生成的 `.deernovaX` 就是这张表。系统控件（`List`、`Form`、按钮）保持系统字号，不要套这些字体。计数、价格、时间这类需要对齐的数字加 `.monospacedDigit()`。中文会自动使用苹方。

## 点击区域

可见高度和点击区域分开处理：按钮看起来是 `Deernova.buttonHeightMd`，再在 `.buttonStyle()` **之后**加 `.padding()` 和 `.contentShape(.rect)`，把可点范围补足到 `Deernova.hitMin`。这时的 padding 在按钮背景外面，是透明的。写法见 [按钮](../components/button.md)。

只有图标的按钮用 `Button("搜索", systemImage: "magnifyingglass")` 加 `.labelStyle(.iconOnly)`，文字会自动成为无障碍标签。

## 细线

自己画的边框（卡片、Composer、任务清单）用 1pt 的 `Deernova.strokeLine`：

```swift
RoundedRectangle(cornerRadius: Deernova.cardRadius)
    .strokeBorder(.line, lineWidth: Deernova.strokeLine)
```

系统的 `Divider()` 和 `List` 的行分隔保持系统样式，不去改。

## 玻璃

- 导航栏、工具栏、标签栏、侧边栏、inspector：用标准的 `NavigationStack`、`NavigationSplitView`、`TabView`、`.toolbar`、`.inspector`，系统会自动渲染成玻璃，不要给它们加背景。玻璃是原生端的优势，Web 应用没有。
- 浮动按钮：`.buttonStyle(.glass)`；主操作用 `.buttonStyle(.glassProminent)` 加 `.tint(.brandAccent)`，一屏最多一个。
- 相邻的几个玻璃元素放进同一个 `GlassEffectContainer`，它们会互相融合，切换时也会跟着变形。
- 完全自定义形状时用 `.glassEffect(.regular, in: .capsule)`；触控端可点击的玻璃加 `.interactive()`，按下时有形变反馈。
- iOS 标签栏在向下滚动时收起：`.tabBarMinimizeBehavior(.onScrollDown)`；搜索用 `Tab(role: .search)`。
- Mac 上侧边栏旁边的大图，用 `.backgroundExtensionEffect()` 延伸到侧边栏下方。
- 嵌套的圆角用 `ConcentricRectangle()`，内层会自动和外层容器同心。

## 动效

- 默认 `.spring(response: 0.35, dampingFraction: 0.85)`；即时反馈用 `.easeOut(duration: Deernova.durationInstant)`，展开和切换用 `Deernova.durationBase`。弹窗、导航的转场交给系统。
- 读取 `@Environment(\.accessibilityReduceMotion)`，开启时把位移、缩放换成 `.opacity` 转场。

## 无障碍

- `@Environment(\.accessibilityReduceTransparency)`：开启时，自己写的半透明效果换成 `.surfaceRaised` 实色。系统玻璃会自动处理。
- `@Environment(\.dynamicTypeSize)`：到 `.accessibility1` 以上时，横排放不下的内容改成竖排（`ViewThatFits` 或 `AnyLayout`）。
- 状态用图标加文字，不只靠颜色。

## 验证

- 每个新界面都在 `#Preview` 里同时看浅色和深色：`.preferredColorScheme(.dark)`。
- iOS 用最大的动态字体看一遍，确认没有文字被截断。
- 用 VoiceOver 或无障碍检查器确认只有图标的按钮都有标签。
- 在系统设置里打开「降低透明度」和「减弱动态效果」各看一次。
