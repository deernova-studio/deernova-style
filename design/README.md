Deernova 是给 macOS 和 iOS 应用用的一套设计语言：只用黑、白、灰。纸面承载内容，液态玻璃（Liquid Glass）承载操作，强调靠明暗对比，不靠彩色。整体紧凑、安静、克制，像一件趁手的工具。

## 原则

1. **纸面与玻璃分层。** 文字、列表、卡片、代码这些内容，放在不透明的纸面上：`canvas`、`surface`、`surface-raised`、`surface-sunken`。工具栏、标签栏、浮动按钮、弹出层这些操作，浮在内容之上，用系统的 Liquid Glass。玻璃上不放内容，内容也不做成玻璃。
2. **黑白灰，强调靠对比。** `accent` 就是墨色本身：浅色主题下主按钮是黑底白字，深色主题下是白底黑字。界面里唯一的彩色是状态色（成功、警告、错误、提示），只在表达状态时出现。
3. **用线条代替阴影。** 区块之间用 `line` 细线分隔（`stroke-hairline`）。只有真正浮起来的东西（菜单、弹窗、浮动面板）才加阴影 `shadow-float`。
4. **衬线用来"说"，无衬线用来"做"。** 标题、空状态、长文阅读（文章、AI 回答）用衬线 `--font-serif`；按钮、标签、列表、表单这些界面文字，用系统无衬线 `--font-sans`。
5. **紧凑。** Mac 正文 13pt、行高约 1.4 倍，控件 24pt、列表行 26pt；靠细线和少量留白分组，不靠大块空白。iOS 保留系统的 17pt 正文和 44pt 点击区域，但按钮看起来只有 36pt。
6. **原生优先。** 系统已有的控件（Toggle、Picker、Menu、DatePicker、Alert）直接用，只通过 `tint` 和字体让它们融入。自定义组件只做系统没有的东西：Composer、Message、StepRow。

## 文案

- 用"你"称呼用户。语气平实直接，不用感叹号，不用 emoji。
- 按钮以动词开头，说清点了会发生什么：「保存」「新建笔记」「删除 3 个文件」。不用「确定」「OK」。操作完成后的提示用完成态：「已保存」「已复制」。
- 错误提示要说明出了什么问题、怎么解决：「网络连接已断开，恢复后会自动重试。」不道歉，不含糊。
- 中文与英文、中文与数字之间加一个半角空格：「同步到 iCloud」「剩余 12 次」。数字和单位用半角。
- 标题、按钮、标签不加句号；完整的句子加句号。
- 空状态写法：标题说明现在的状态，正文告诉用户下一步做什么。例如「还没有笔记」/「写下第一条想法，它会同步到你所有的设备。」

## 颜色

所有颜色都是语义 token，分 Light 和 Dark 两套主题，两套都验算过对比度。灰阶全部是中性灰，不偏暖也不偏冷。

- **纸面层级**，从下到上：窗口底色 `canvas` → 内容区和卡片 `surface` → 输入框、Composer、弹出层 `surface-raised`。代码块、用户消息气泡、展开的详情用 `surface-sunken`。
- **文字**：正文用 `ink`，次要信息用 `ink-secondary`，占位符、时间戳、计数用 `ink-tertiary`。三者在四种纸面上都不低于 4.5:1。
- **线条**：分隔线和卡片描边用 `line`，属于装饰。输入框边框用 `line-control`，不低于 3:1，让人看得出这里可以输入。
- **强调**：`accent` 等于 `ink`，用于主按钮填充、选中指示、焦点环。主按钮上的文字用 `on-accent`，不要写死白色，深色主题下它是黑色。浅灰强调底用 `accent-soft`，上面的文字用 `ink`。链接用 `ink` 加下划线，不用彩色。
- **焦点**：`focus-ring` 等于 `accent`，2pt 实线，外偏移 2pt。
- **状态色**：`success`（青绿）、`warning`（赭黄）、`danger`（莓红）、`info`（蓝），各自配一个 `-soft` 浅底。这是界面里仅有的彩色，只用在状态上，不拿来装饰。状态必须同时带图标或文字，不能只靠颜色区分。`success` 特意偏青，和 `danger` 拉开距离，色弱用户也能分辨。开关打开时用 `success`，因为黑白开关在深色主题下看不清圆钮。
- **交互底色**：悬停用 `fill-hover`，选中用 `fill-selected`。它们是半透明的，叠在任何纸面上都成立。
- **仅限网页预览**：`glass-fill`、`glass-stroke`、`shadow-glass` 只是在网页里模拟玻璃效果。App 里一律用系统的 `.glassEffect()`，不要用这些值自己画玻璃。

在 SwiftUI 里落地：在 Asset Catalog 里按 token 名建 Color Set，分别填入 Any 和 Dark 两套值，再写一个扩展来引用。扩展写在 `ShapeStyle` 上，这样 `.foregroundStyle(.inkSecondary)`、`.background(.surface, in: …)` 都能直接用点语法。组件说明里的代码都按这套命名书写：

```swift
extension ShapeStyle where Self == Color {
    static var canvas: Color { Color("canvas") }
    static var surface: Color { Color("surface") }
    static var surfaceRaised: Color { Color("surface-raised") }
    static var surfaceSunken: Color { Color("surface-sunken") }
    static var ink: Color { Color("ink") }
    static var inkSecondary: Color { Color("ink-secondary") }
    static var inkTertiary: Color { Color("ink-tertiary") }
    static var line: Color { Color("line") }
    static var brandAccent: Color { Color("accent") }   // 等于 ink；避开系统的 .accentColor
    // success、successSoft、warning、danger、fillSelected 等其余 token 同理
}

// 在 App 入口统一着色，系统控件会自动跟随（按钮、选中态变成黑 / 白）
WindowGroup {
    RootView().tint(.brandAccent)
}
// 开关单独着色
Toggle("iCloud 同步", isOn: $sync).tint(.success)
```

## 字体

全部使用系统字体，不打包字体文件：App 体积不增加，也自动支持动态字体（Dynamic Type）。

| 角色 | 西文 | 中文 | SwiftUI |
| --- | --- | --- | --- |
| 衬线：标题、长文 | New York | 苹方 | `.system(.title, design: .serif)` |
| 无衬线：界面 | SF Pro | 苹方 | `.body`、`.headline` 等 |
| 等宽：代码、数据 | SF Mono | 苹方 | `.system(.body, design: .monospaced)` |

- macOS 和 iOS 各有一套字号，见 Typography。Mac 正文 13pt、行高 18（`mac-body`），长文 14pt、行高 22（`mac-prose`）；iOS 正文 17pt、行高 23（`ios-body`）。
- iOS 一律用文本样式（`.body`、`.headline`），不要写死字号，这样动态字体才会生效。需要衬线时用 `.system(.title2, design: .serif)` 这种写法，同样能随系统缩放。
- 界面文字行高约为字号的 1.4 倍；长文阅读放宽到 1.5–1.6 倍，中文读起来不挤。
- 如果想让中文标题也有衬线的气质，可以打包思源宋体（Source Han Serif，开源可商用）的子集，只用在大标题和营销页上。界面文字始终用苹方。
- 需要上下对齐的数字（计数、价格、时间）用等宽数字：`.monospacedDigit()`。

## 间距与尺寸

- 采用 4pt 网格：`space-1`（4）、`space-2`（8）、`space-3`（12）、`space-4`（16）、`space-5`（20）、`space-6`（24）、`space-8`（32）、`space-10`（40）。日常布局基本只用到 `space-1` 到 `space-4`。
- **macOS 紧凑**：控件高 `control-mac`（24），侧边栏和列表行 `row-mac`（26），内容区边距 `space-4`，卡片内边距 `space-3`，消息之间 `space-4`，侧边栏宽 `sidebar-mac`（220）。
- **iOS**：可点区域至少 `control-ios`（44）。按钮的可见高度：默认 `button-ios`（36），小号 `button-ios-sm`（30），通栏主按钮 `control-ios-lg`（46）。页面左右边距 `space-4`，卡片之间 `space-2`，分组之间 `space-5`。
- 长文阅读的栏宽不超过 `content-max`（680），14pt 下大约每行 45 个汉字。
- 组与组之间的间距至少是组内间距的 2 倍。层次靠间距建立，不靠加更多的线和框。

## 圆角

- `radius-xs`（4）：标签、复选框。
- `radius-sm`（6）：Mac 按钮、输入框、侧边栏选中块。
- `radius-md`（8）：Mac 卡片、横幅、代码块、菜单。
- `radius-lg`（12）：iOS 卡片、分组列表、Composer、消息气泡、Mac 侧边栏面板。
- `radius-xl`（24）：iOS 底部弹窗、单行 Composer。
- `radius-full`：胶囊和圆形，用于玻璃按钮、iOS 主按钮、发送按钮。
- 嵌套时保持同心：内圆角 = 外圆角 − 内边距。iOS 26 / macOS 26 起可以直接用 `ConcentricRectangle()`，内层会自动和外层容器同心。

## 线条

- `stroke-hairline`：1 个物理像素，在 Retina 屏上是 0.5pt，用于分隔线和卡片描边。SwiftUI 里写成 `1 / displayScale`，`displayScale` 从 `@Environment(\.displayScale)` 读取。
- `stroke-control`：1pt，用于输入框边框。
- `stroke-focus`：2pt，用于焦点环。
- 列表分隔线从文字起点开始，不贯穿到左边缘。

## 层级与阴影

从下到上分三层：

1. 纸面：`canvas` 和 `surface`。
2. 用细线分隔的内容块：没有阴影。
3. 浮层：玻璃控件、菜单、弹窗，带 `shadow-float` 或系统玻璃自带的阴影。

卡片不加阴影。

## Liquid Glass

目标系统设为 iOS 26+ / macOS 26+，直接用系统 API，不写兼容层。

**用玻璃的地方**（大部分由系统自动提供）：

- 导航栏、工具栏、标签栏、Mac 侧边栏：使用标准的 `NavigationStack`、`NavigationSplitView`、`TabView`、`.toolbar`，系统会自动渲染成玻璃。
- 浮动操作按钮、浮动工具条：用 `.glassEffect()`。相邻的几个玻璃元素放进同一个 `GlassEffectContainer`，它们会互相融合，切换时也会跟着变形。
- 底部弹窗、弹出菜单、popover：系统自动处理。
- 玻璃层上的主操作用 `.buttonStyle(.glassProminent)` 加 `.tint(.brandAccent)`，次要操作用 `.buttonStyle(.glass)`。

**不用玻璃的地方**：卡片、列表行、消息、输入框、代码块，以及所有需要长时间阅读的内容。

**规则**：

- 玻璃上不叠玻璃。
- 玻璃上只放图标和很短的标签，不放段落。
- 只有主操作的玻璃才用实色（黑底白图标），一屏最多一个。
- iOS 上可点击的自定义玻璃加 `.interactive()`，按下时会有形变反馈。
- 让内容从工具栏下面滚过去，保留系统的滚动边缘效果。不要给工具栏加实色背景。
- iOS 标签栏在向下滚动时收起：`.tabBarMinimizeBehavior(.onScrollDown)`。
- Mac 上侧边栏旁边的大图，用 `.backgroundExtensionEffect()` 延伸到侧边栏下方。
- 用户开启「降低透明度」后，系统会自动把玻璃换成实色。自己写的半透明效果也要读取 `accessibilityReduceTransparency`，并做同样的处理。

```swift
// 浮动工具条：两个玻璃按钮融合成一组
GlassEffectContainer(spacing: 12) {
    HStack(spacing: 12) {
        Button("新建", systemImage: "plus") { createNote() }
            .buttonStyle(.glassProminent)
        Button("搜索", systemImage: "magnifyingglass") { search() }
            .buttonStyle(.glass)
    }
}
.tint(.brandAccent)
```

## 动效

- 默认用弹簧动画：`.spring(response: 0.35, dampingFraction: 0.85)`。悬停、按压这类即时反馈用 0.12s，展开、切换用 0.2s，弹窗的动画交给系统。
- 动效用来说明因果：东西从哪里来、到哪里去。业务界面避免无目的的循环；品牌展示可在不妨碍阅读的前提下使用可暂停的叙事动效。
- 用户开启「减弱动态效果」（`accessibilityReduceMotion`）后，位移和缩放动画换成淡入淡出。

连续动效、状态切换和中断恢复的规则见 [动效与状态稳定性](motion.md)。

## 图标

- 只用 SF Symbols，和系统保持一致。不用 emoji 当图标。
- 图标粗细跟随旁边的文字。Mac 上图标 14pt，13pt 文字旁的图标用 `.medium`，看起来更清楚。
- 默认颜色 `ink-secondary`，选中态和主操作用 `ink`。图标不用彩色，状态图标除外。多层符号用 `.symbolRenderingMode(.hierarchical)`。
- 状态图标固定为：成功 `checkmark.circle.fill`，警告 `exclamationmark.triangle.fill`，错误 `xmark.octagon.fill`，提示 `info.circle.fill`。
- 目前还没有品牌标志，界面里先用文字名称。做好标志后，再新增一个 Logos 资产组。
- 组件预览里的图标是近似 SF Symbols 的线稿，App 里换成对应的 SF Symbols。

## 无障碍

- 每个文字 token 在它说明里注明的纸面上不低于 4.5:1，两套主题都验算过。界面紧凑不等于字小：Mac 正文不低于 13pt，说明文字不低于 11pt。
- iOS 全面支持动态字体，在最大字号下也不截断文字：允许换行，横排放不下就改成竖排。
- iOS 上每个可点元素的点击区域至少 44×44pt，看起来可以更小（按钮 36pt、小按钮 30pt），差的部分用透明的内边距补足；Mac 上的图标按钮至少 24×24pt。
- 只靠颜色传达的信息，一律补上图标或文字。

## 组件

组件页里的预览是网页上的近似效果，用来对齐尺寸、颜色和层级。App 里用 SwiftUI 实现，每个组件的说明里都写了对应的 SwiftUI 写法，以及需要传入哪些内容。Layouts 分组里有一个 Mac 窗口示例和一个 iPhone 界面示例，展示各个组件组合在一起的样子。
