# SwiftUI 落地

在 macOS 和 iOS 上实现 Deernova 的做法。规则本身见 [基础](foundations.md)，数值见 [设计变量](tokens.md)，各类界面的写法见 [界面模式](patterns.md)。

## 系统版本

Deernova 按 iOS 26 / macOS 26 设计，Liquid Glass 相关的 API（`.glassEffect()`、`GlassEffectContainer`、`.buttonStyle(.glass)` 等）从这两个版本开始提供。

- 先看项目的部署目标。不要为了用这份规范去提高项目的最低系统版本。
- 部署目标低于 26 时，系统导航栏、工具栏、标签栏会自动使用当时的材质，不用处理；自定义的浮动按钮用 `if #available(iOS 26, macOS 26, *)` 分支，旧系统上退回 `.background(.regularMaterial, in: .capsule)`。
- 这里的示例是设计参考，不是编译过的 SDK。落地后要在项目的 SDK 下编译，并在真机或模拟器上看效果。

## 颜色

在 Asset Catalog 里按 token 名建 Color Set，分别填入 Any 和 Dark 两套值（见 [设计变量](tokens.md) 的「颜色」）。`glass-fill`、`glass-stroke` 只用于网页，App 里不要建。

再写一个扩展来引用。扩展写在 `ShapeStyle` 上，这样 `.foregroundStyle(.inkSecondary)`、`.background(.surface, in: …)` 都能直接用点语法：

```swift
extension ShapeStyle where Self == Color {
    // 纸面
    static var canvas: Color { Color("canvas") }
    static var surface: Color { Color("surface") }
    static var surfaceRaised: Color { Color("surface-raised") }
    static var surfaceSunken: Color { Color("surface-sunken") }
    // 文字与线条
    static var ink: Color { Color("ink") }
    static var inkSecondary: Color { Color("ink-secondary") }
    static var inkTertiary: Color { Color("ink-tertiary") }
    static var line: Color { Color("line") }
    static var lineControl: Color { Color("line-control") }
    // 强调：accent 等于 ink。命名为 brandAccent，避开系统的 .accentColor
    static var brandAccent: Color { Color("ink") }
    static var accentSoft: Color { Color("accent-soft") }
    static var onAccent: Color { Color("on-accent") }
    // 状态
    static var success: Color { Color("success") }
    static var successSoft: Color { Color("success-soft") }
    static var warning: Color { Color("warning") }
    static var warningSoft: Color { Color("warning-soft") }
    static var danger: Color { Color("danger") }
    static var dangerSoft: Color { Color("danger-soft") }
    static var info: Color { Color("info") }
    static var infoSoft: Color { Color("info-soft") }
    // 交互
    static var fillHover: Color { Color("fill-hover") }
    static var fillSelected: Color { Color("fill-selected") }
}
```

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

| 用途 | macOS | iOS |
| --- | --- | --- |
| 空状态、引导页大标题 | `.system(size: 22, weight: .semibold, design: .serif)` | `.system(.largeTitle, design: .serif)` |
| 文章、页面标题 | `.system(.title3, design: .serif).weight(.semibold)` | `.system(.title2, design: .serif)` |
| 区块标题 | `.headline` | `.headline` |
| 正文、按钮、列表 | `.body` | `.body` |
| 长文、AI 回答 | `.system(size: 14, design: .serif)` 加 `.lineSpacing(5)`，行高约 22 | `.system(.body, design: .serif)` 加 `.lineSpacing(6)`，行高约 26 |
| 说明、元信息 | `.callout`、`.caption` | `.footnote`、`.caption` |
| 代码 | `.system(.callout, design: .monospaced)` | `.system(.footnote, design: .monospaced)` |

- iOS 上始终用文本样式，不要写死 `size:`，否则动态字体不生效。
- 计数、价格、时间这类需要对齐的数字加 `.monospacedDigit()`。
- 中文会自动使用苹方，不需要单独指定。

## 尺寸与点击区域

- Mac 默认控件 24pt、列表行 26pt，用系统 `List` 和 `.controlSize(.regular)` 基本就能得到；侧边栏宽度用 `.navigationSplitViewColumnWidth(min: 180, ideal: 220, max: 300)`。
- iOS 按钮的可见高度和点击区域分开处理：按钮看起来 36pt（小号 30pt，通栏 46pt），再用透明的内边距和 `.contentShape(.rect)` 把可点范围补足到 44pt。写法见 [界面模式](patterns.md) 的「按钮」。
- 只有图标的按钮用 `Button("搜索", systemImage: "magnifyingglass")` 加 `.labelStyle(.iconOnly)`，文字会自动成为无障碍标签。

## 细线

`stroke-hairline` 是 1 个物理像素，从环境里读屏幕倍率：

```swift
@Environment(\.displayScale) private var displayScale

RoundedRectangle(cornerRadius: 8)
    .strokeBorder(.line, lineWidth: 1 / displayScale)
```

系统的 `Divider()` 已经是细线，列表里直接用。

## 玻璃

- 导航栏、工具栏、标签栏、Mac 侧边栏：用标准的 `NavigationStack`、`NavigationSplitView`、`TabView`、`.toolbar`，系统会自动渲染成玻璃，不要给它们加背景。
- 浮动按钮：`.buttonStyle(.glass)`；主操作用 `.buttonStyle(.glassProminent)` 加 `.tint(.brandAccent)`，一屏最多一个。
- 相邻的几个玻璃元素放进同一个 `GlassEffectContainer`，它们会互相融合，切换时也会跟着变形。
- 完全自定义形状时用 `.glassEffect(.regular, in: .capsule)`；iOS 上可点击的玻璃加 `.interactive()`，按下时有形变反馈。
- iOS 标签栏在向下滚动时收起：`.tabBarMinimizeBehavior(.onScrollDown)`；搜索用 `Tab(role: .search)`，会成为右侧单独的圆形玻璃按钮。
- Mac 上侧边栏旁边的大图，用 `.backgroundExtensionEffect()` 延伸到侧边栏下方。
- 嵌套的圆角用 `ConcentricRectangle()`，内层会自动和外层容器同心。

```swift
// 浮动工具条：两个玻璃按钮融合成一组
GlassEffectContainer(spacing: 12) {
    HStack(spacing: 12) {
        Button("搜索", systemImage: "magnifyingglass") { search() }
            .buttonStyle(.glass)
        Button("新建", systemImage: "plus") { createNote() }
            .buttonStyle(.glassProminent)
    }
    .labelStyle(.iconOnly)
}
.tint(.brandAccent)
```

## 动效

- 默认 `.spring(response: 0.35, dampingFraction: 0.85)`；即时反馈用 `.easeOut(duration: 0.12)`，展开和切换约 0.2s。弹窗、导航的转场交给系统。
- 读取 `@Environment(\.accessibilityReduceMotion)`，开启时把位移、缩放换成 `.opacity` 转场。

## 无障碍

- `@Environment(\.accessibilityReduceTransparency)`：开启时，自己写的半透明效果换成 `.surfaceRaised` 实色。系统玻璃会自动处理。
- `@Environment(\.dynamicTypeSize)`：到 `.accessibility1` 以上时，横排放不下的内容改成竖排（`ViewThatFits` 或 `AnyLayout`）。
- 状态用图标加文字，不只靠颜色；状态图标见 [基础](foundations.md) 的「图标」。

## 验证

- 每个新界面都在 `#Preview` 里同时看浅色和深色：`.preferredColorScheme(.dark)`。
- iOS 用最大的动态字体看一遍，确认没有文字被截断。
- 用 VoiceOver 或无障碍检查器确认只有图标的按钮都有标签。
- 在系统设置里打开「降低透明度」和「减弱动态效果」各看一次。
