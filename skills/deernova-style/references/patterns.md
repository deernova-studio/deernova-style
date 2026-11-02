# 界面模式

按场景整理的常见界面做法。它们是规格和参考写法，不是要安装的组件：先用项目里已有的组件或系统控件实现，没有的再按这里的规格补上。

SwiftUI 示例默认已经按 [SwiftUI 落地](swiftui.md) 接好了颜色扩展（`.ink`、`.surface`、`.brandAccent` 等）。用 Web 实现时，把同样的规格换成 [Web 落地](web.md) 里的 CSS 变量和原生元素。想看组合在一起的效果，打开 `assets/screens/` 里的截图。

- **页面骨架**：Mac 窗口、iPhone 页面
- **操作**：按钮、玻璃操作层、分段控件
- **输入**：文本框、Composer 输入区
- **导航与列表**：Mac 侧边栏、iOS 分组列表与设置页
- **内容**：卡片、标签、代码块、空状态
- **反馈**：横幅与轻提示、底部弹窗
- **AI 对话**：消息、执行步骤

## 页面骨架

先定骨架，再填内容。Mac 是侧边栏加内容区，iPhone 是导航栈加底部标签栏。

### Mac 窗口

Mac 应用窗口的标准结构：左边是悬浮的玻璃侧边栏，右边内容区的上方浮着玻璃工具栏，下方浮着 Composer。效果见 `assets/screens/mac-window-light.png` 和 `mac-window-dark.png`。

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

### iPhone 页面

iPhone 上的两种典型页面：一个列表页，一个对话页。展示纸面和玻璃在手机上怎么分层。效果见 `assets/screens/iphone-screens-light.png` 和 `iphone-screens-dark.png`。

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

## 操作

### 按钮

按钮执行一个动作；每个视图最多一个主按钮（`accent` 填充，浅色主题黑底白字、深色主题白底黑字），用来完成这一屏存在的理由。

**变体**

- 主按钮：`accent` 底、`on-accent` 字。用于保存、发送、购买等关键动作。
- 次按钮：`surface-raised` 底、`line` 描边、`ink` 字，带 `shadow-control`。
- 文字按钮：无底，`ink-secondary` 字，悬停时出现 `fill-hover`。用于工具栏和卡片内的次要操作。
- 危险按钮：`danger-soft` 底、`danger` 字。只有在最终确认弹窗里，才用系统的 `.destructive` 样式。

**尺寸**

| | macOS | iOS |
| --- | --- | --- |
| 小 | `control-mac-sm`（20），`radius-xs`，11pt | `button-ios-sm`（30），胶囊，13pt 半粗，用于卡片和列表里的行内操作 |
| 默认 | `control-mac`（24），`radius-sm`，13pt 中粗 | `button-ios`（36），胶囊，15pt 半粗 |
| 大 | `control-mac-lg`（28） | `control-ios-lg`（46），通栏胶囊，16pt 半粗，只用于页面底部或弹窗里唯一的主操作 |

iOS 按钮看起来可以比 44pt 小，但点击区域必须补足到 44pt（`control-ios`）：在按钮外面加透明的内边距，或者用 `.contentShape` 扩大可点范围。

**iOS 怎么选尺寸**：不是随意挑，按按钮所在的位置定。

- 列表行、卡片角落里的行内操作（获取、关注、打开）→ 小号 30pt。
- 页面和卡片里的普通按钮，包括并排的两个按钮（以后再说 / 开启）→ 默认 36pt。同一行里的按钮用同一个尺寸。
- 整页唯一的主操作，放在页面底部（登录、订阅、开始使用）→ 通栏 46pt，一屏最多一个。
- 导航栏、标签栏、工具栏里的按钮 → 用系统控件，不自己设尺寸。

三种尺寸放在手机里的样子见 `assets/screens/iphone-button-sizes-light.png`。

iOS 按钮比 Mac 大是有意的：手指比鼠标指针粗，Mac 默认 24pt，iOS 默认 36pt。在 Mac 屏幕上看 iOS 设计图会比真机上大一些，因为 Mac 上 1pt 的物理尺寸比 iPhone 上大，判断大小时以真机为准。

**需要提供**：标签（动词开头）、可选的 SF Symbol、点击动作。加载中时保持按钮宽度不变，把标签换成 `ProgressView()`。

```swift
Button("保存") { save() }
    .buttonStyle(.borderedProminent)   // 主按钮，颜色跟随 .tint(.brandAccent)
Button("取消", role: .cancel) { dismiss() }
    .buttonStyle(.bordered)
Button("删除", role: .destructive) { delete() }

// iOS 默认按钮：看起来 36pt 高，点击区域补足到 44pt
Button("继续") { next() }
    .font(.subheadline.weight(.semibold))
    .buttonStyle(.borderedProminent)
    .buttonBorderShape(.capsule)
    .controlSize(.regular)
    .padding(.vertical, 4)                 // 透明的外边距，把点击区域撑到 44pt
    .contentShape(.rect)

// iOS 底部通栏主按钮（46pt）
Button { start() } label: {
    Text("开始使用").font(.callout.weight(.semibold)).frame(maxWidth: .infinity, minHeight: 46)
}
.buttonStyle(.borderedProminent)
.buttonBorderShape(.capsule)

// 放在玻璃层上时改用 .glassProminent / .glass，见「玻璃操作层」
```

**不要**：一个视图里放两个主按钮；用「确定」「OK」做标签；按钮里写一整句话；为了强调把次要按钮也做成黑底。

### 玻璃操作层

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

### 分段控件

分段控件，在同一份数据的 2–4 种视图或范围之间切换。

**需要提供**：选项列表（每项 2–4 个字，或者一个 SF Symbol）和绑定的选中值。

**规格**：底槽 `fill-selected`；选中块 `surface-raised` 加 `shadow-control`；未选中文字 `ink-secondary`，选中文字 `ink`。Mac 上外层 `radius-sm`、内边距 2，内层 `radius-xs`，两层同心；高度 `control-mac-sm`。iOS 上是胶囊形，高 32pt。

```swift
Picker("视图", selection: $mode) {
    Text("列表").tag(Mode.list)
    Text("卡片").tag(Mode.cards)
    Text("日历").tag(Mode.calendar)
}
.pickerStyle(.segmented)
.labelsHidden()
```

直接用系统控件就能得到上面的效果，不需要自己画。

**不要**：选项超过 4 个（改用 Menu 或 Picker）；拿它当执行动作的按钮组；文字长短差别太大。

## 输入

### 文本框

单行文字输入，配一个标签和一句说明。

**需要提供**：标签（名词）、绑定的文本、可选的占位符（给示例，不要重复标签）、说明文字，校验失败时提供错误信息。

**规格**

- 底色 `surface-raised`，边框 `stroke-control` 宽、`line-control` 色。Mac 用 `radius-sm`，高 `control-mac`；iOS 用 `radius-md`，高 `control-ios`。
- 聚焦时边框变 `focus-ring`，外圈加 3pt 的 `accent-soft` 灰色光晕。
- 出错时边框变 `danger`，说明文字换成错误信息，同样用 `danger` 色。错误信息要说清楚怎么改。
- 标签 12pt 中粗 `ink-secondary`，放在输入框上方；说明 11pt `ink-tertiary`，放在下方。

```swift
VStack(alignment: .leading, spacing: 6) {
    Text("邮箱").font(.caption.weight(.medium)).foregroundStyle(.inkSecondary)
    TextField("name@example.com", text: $email)
        .textFieldStyle(.roundedBorder)          // Mac；iOS 用自定义样式实现上面的规格
        .textContentType(.emailAddress)
        .keyboardType(.emailAddress)             // iOS
    Text(error ?? "用于接收登录验证码。")
        .font(.caption)
        .foregroundStyle(error == nil ? .inkTertiary : .danger)
}
```

iOS 设置页这类表单，直接在 `Form` 里用 `TextField`，交给系统的分组样式（见「iOS 分组列表与设置页」）。

**不要**：只用占位符代替标签；出错时只把边框变红、不给说明；把多行输入塞进单行框（多行用 `TextField(axis: .vertical)` 或 Composer）。

### Composer 输入区

多行输入框加一条工具栏，用于发消息、写笔记、向 AI 提问。

**需要提供**：绑定的文本、占位符、发送动作、是否可以发送（内容为空或正在生成时禁用）。可选：附件列表、左侧的工具按钮（添加附件、模式选择）、右侧的状态文字（剩余次数、字数）。

**规格**

- 容器：`surface-raised` 底、`line` 细线描边、`radius-lg`、`shadow-float`；内边距上、右、下 8，左 12。获得焦点时描边加深为 `line-control`。
- 文字：Mac 13pt（`mac-body`），iOS 17pt（`ios-body`）。高度随内容增长，最多 8 行，超出后内部滚动。
- 附件：放在输入区上方，`surface-sunken` 底、`radius-sm` 的文件条。
- 工具条：左边是 24pt 的图标按钮和 20pt 高的胶囊形选择器（`line` 描边），右边是状态文字和发送按钮。
- 发送按钮：24pt 圆形，`accent` 底、`on-accent` 箭头（浅色主题黑底白箭头）。不能发送时换成 `fill-selected` 底、`ink-tertiary` 箭头。正在生成时变成「停止」方块。
- Mac 上 Return 发送，Shift-Return 换行；iOS 上换行键就是换行，只能点按钮发送。

```swift
VStack(alignment: .leading, spacing: 4) {
    TextField("写点什么，或拖入文件", text: $draft, axis: .vertical)
        .lineLimit(1...8)
        .textFieldStyle(.plain)
        .onSubmit(send)                                   // Mac：Return 发送
    HStack(spacing: 4) {
        Button("添加附件", systemImage: "plus") { attach() }
            .labelStyle(.iconOnly).buttonStyle(.borderless)
        Spacer()
        Button(action: send) {
            Image(systemName: "arrow.up")
                .fontWeight(.semibold)
                .frame(width: 24, height: 24)
        }
        .buttonStyle(.borderedProminent)
        .buttonBorderShape(.circle)
        .disabled(draft.isEmpty)
    }
}
.padding(EdgeInsets(top: 8, leading: 12, bottom: 8, trailing: 8))
.background(.surfaceRaised, in: .rect(cornerRadius: 12))
.overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(.line, lineWidth: 1 / displayScale))
.shadow(color: .black.opacity(0.08), radius: 10, y: 6)
```

**不要**：把 Composer 做成玻璃（它承载的是内容）；把发送按钮放到框外；禁用时把按钮直接隐藏，让布局跳动。

## 导航与列表

### Mac 侧边栏

macOS 应用的主导航：顶部放全局操作，下面按分组列出各个位置。

**需要提供**：分组（标题可选）、每一项的 SF Symbol 和名称、可选的计数或快捷键、绑定的选中项。

**规格**

- 宽度 `sidebar-mac`（220），用户可以拖动调整。macOS 26 上侧边栏是悬浮的玻璃面板，由 `NavigationSplitView` 自动提供。
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

### iOS 分组列表与设置页

iOS 分组列表，用于设置页、详情页和各种表单。

**需要提供**：分组，每个分组可以有页头和页脚说明；每一行提供标题，以及可选的图标、右侧的值、开关或箭头，点击后跳转或执行动作。

**规格**

- 页面底色 `canvas`，分组底色 `surface-raised`，`radius-lg`，左右边距 `space-4`，分组之间 `space-5`。
- 每行最小高度 `control-ios`（44），左右内边距 `space-4`，文字 17pt `ink`；右侧的值用 `ink-secondary`，箭头用 `ink-tertiary`。
- 图标放在 28pt 的方块里，`accent-soft` 浅灰底、`ink` 图标、`radius-sm`。整个列表统一用灰色，不要每行一个颜色。
- 分隔线 `stroke-hairline`、`line` 色，从文字起点开始。
- 页头 13pt `ink-secondary`，页脚 13pt `ink-tertiary`，页脚写清楚这个设置会带来什么后果。
- 开关打开时用 `success` 色。不要用黑白色调的开关：深色主题下白色轨道会把白色圆钮吞掉。

```swift
Form {
    Section("账号") {
        NavigationLink { ProfileView() } label: {
            LabeledContent { Text("林一") } label: { Label("个人资料", systemImage: "person") }
        }
    }
    Section {
        Toggle(isOn: $iCloudSync) { Label("iCloud 同步", systemImage: "icloud") }
            .tint(.success)
    } header: {
        Text("同步")
    } footer: {
        Text("关闭 iCloud 同步后，新笔记只保存在这台设备上。")
    }
}
.scrollContentBackground(.hidden)
.background(.canvas)
.tint(.brandAccent)
```

Mac 上的设置窗口同样用 `Form` 加 `.formStyle(.grouped)`，系统会给出对应的 Mac 样式。

**不要**：每行用不同颜色的图标；页脚写成一大段；在列表行里放主按钮（主按钮放在页面底部）。

## 内容

### 卡片

卡片把一条内容的摘要装进一个可以点开的块里，用于网格和看板。

**需要提供**：标题、一到两行摘要、元信息（时间、分类、状态标签），点击后打开详情。

**规格**

- `surface` 底、`stroke-hairline` 宽的 `line` 描边，不加阴影。Mac 用 `radius-md`，iOS 用 `radius-lg`。Mac 内边距 `space-3`，iOS 内边距 14pt × `space-4`，内部间距 `space-1`。
- 标题用衬线 15pt 半粗（Mac）或 17pt（iOS）；摘要用 `mac-callout` 或 `ios-footnote`、`ink-secondary`，最多 3 行；元信息 11pt `ink-tertiary`。
- 悬停时描边加深为 `line-control`。选中时描边变成 1pt 的 `ink`。
- 网格间距 `space-2`（Mac）或 `space-3`（iOS）；每张卡片高度由内容决定，同一行顶部对齐。

```swift
VStack(alignment: .leading, spacing: 4) {
    Text(note.title).font(.system(.headline, design: .serif))
    Text(note.summary).font(.callout).foregroundStyle(.inkSecondary).lineLimit(3)
    Text(note.date, format: .relative(presentation: .named))
        .font(.caption).foregroundStyle(.inkTertiary)
}
.padding(12)
.frame(maxWidth: .infinity, alignment: .leading)
.background(.surface, in: .rect(cornerRadius: 8))
.overlay(
    RoundedRectangle(cornerRadius: 8)
        .strokeBorder(isSelected ? .ink : .line,
                      lineWidth: isSelected ? 1 : 1 / displayScale)
)
```

**不要**：给卡片加阴影或玻璃效果；在卡片左侧加一条彩色竖条；卡片里套卡片；一张卡片里放多个主按钮。

### 标签

一到四个字的标签，标出状态或分类，放在标题旁边或元信息里。

**需要提供**：文字、语气（中性 / 强调 / success / warning / danger / info）；表示状态时加一个圆点。

**规格**

- Mac：高 18pt，`radius-xs`，11pt 中粗，左右内边距 6pt。iOS：高 22pt，胶囊形，12pt。
- 中性标签：`fill-selected` 底、`ink-secondary` 字。强调标签：`accent` 黑底、`on-accent` 白字，只用于「新」「Pro」这类需要跳出来的少数标记。有语气的标签：用对应的 `-soft` 作底色，用语气色作文字和圆点，例如 `success-soft` 底配 `success` 字。
- 表示状态时一定加 5pt 圆点（`radius-full`），文字本身就要说清楚状态是什么，不能只靠颜色。

```swift
struct Tag: View {
    var text: LocalizedStringKey
    var tone: Color = .inkSecondary
    var background: Color = .fillSelected
    var showsDot = false

    var body: some View {
        HStack(spacing: 4) {
            if showsDot { Circle().frame(width: 5, height: 5) }
            Text(text)
        }
        .font(.caption.weight(.medium))
        .foregroundStyle(tone)
        .padding(.horizontal, 6)
        .frame(height: 18)
        .background(background, in: .rect(cornerRadius: 4))
    }
}

Tag(text: "已同步", tone: .success, background: .successSoft, showsDot: true)
```

**不要**：用标签当按钮；一行里放超过三个标签；大量使用黑底强调标签（它和主按钮长得像，多了就分不清）。

### 代码块

展示代码、命令或结构化数据，带语言标签和复制按钮。

**需要提供**：代码文本、语言名称；可选的文件名（替代语言名显示在表头）。

**规格**

- `surface-sunken` 底、`line` 细线描边、`radius-md`。表头高 28pt，左边是语言名或文件名（11pt 等宽、`ink-tertiary`），右边是一个小号文字按钮「复制」；点击后显示「已复制」1.5 秒。
- 代码字体 `code-mac` 或 `code-ios`，内边距上下 `space-2`、左右 `space-3`，过长时横向滚动，不自动换行。
- 语法高亮只用灰阶：关键字 `ink` 加粗，字符串 `ink-secondary`，注释 `ink-tertiary` 加斜体，其余 `ink`。这些颜色在 `surface-sunken` 上都不低于 4.5:1。

```swift
VStack(alignment: .leading, spacing: 0) {
    HStack {
        Text(language).font(.caption.monospaced()).foregroundStyle(.inkTertiary)
        Spacer()
        Button(copied ? "已复制" : "复制", systemImage: copied ? "checkmark" : "doc.on.doc") { copy() }
            .buttonStyle(.borderless).controlSize(.small)
    }
    .padding(.horizontal, 12).frame(height: 28)
    Divider()
    ScrollView(.horizontal) {
        Text(highlighted)                 // 用 AttributedString 按上面的颜色着色
            .font(.system(.callout, design: .monospaced))
            .textSelection(.enabled)
            .padding(.vertical, 8).padding(.horizontal, 12)
    }
}
.background(.surfaceSunken, in: .rect(cornerRadius: 8))
.overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(.line, lineWidth: 1 / displayScale))
```

**不要**：用彩色的编辑器配色主题（和黑白灰的整体风格冲突）；给代码块加阴影；自动换行打乱缩进。

### 空状态

列表、搜索结果或整个页面没有内容时显示：说明现在是什么状态，再给出下一步。

**需要提供**：SF Symbol、标题（描述状态）、一句正文（告诉用户怎么开始），以及最多一个主操作和一个次操作。

**规格**

- 在可用区域里居中。图标 28pt、细线、`ink-tertiary` 色；标题用 `mac-display` 或 `ios-title`（衬线）；正文 `ink-secondary`，最大宽度 320pt。
- 按钮用大号：Mac 是 `control-mac-lg`，iOS 是 `control-ios`。
- 搜索没有结果时不放按钮，标题写成「没有找到"关键词"」，正文给出修改建议。

```swift
ContentUnavailableView {
    Label("还没有笔记", systemImage: "doc.text")
        .font(.system(.title2, design: .serif))
} description: {
    Text("写下第一条想法，它会同步到你所有的设备。")
} actions: {
    Button("新建笔记") { create() }.buttonStyle(.borderedProminent)
    Button("从文件导入") { importFile() }
}

// 搜索没有结果
ContentUnavailableView.search(text: query)
```

**不要**：用插画或吉祥物填满空白；标题写「空空如也」这种玩笑话；出现三个以上的按钮。

## 反馈

### 横幅与轻提示

页面内的提示条，告诉用户一件需要知道的事，必要时附带一个解决动作。轻提示（Toast）是它的短暂版本。

**需要提供**：语气（中性 / success / warning / danger）、标题（一句话说明状态）、正文（后果或解决办法）、可选的一个动作按钮；能关闭的横幅还要提供关闭动作。

**规格**

- 中性横幅：`surface-raised` 底、`line` 描边、`ink-secondary` 图标。有语气的横幅：对应的 `-soft` 底、无描边、图标用语气色。文字始终是 `ink` 和 `ink-secondary`。
- `radius-md`，内边距上下 `space-2`、左右 `space-3`，图标 16pt；标题 13pt 半粗，正文 12pt。图标用 [基础](foundations.md) 「图标」一节里的状态符号。
- 动作按钮用小号次按钮，放在右侧，一个横幅最多一个。
- 轻提示：底部居中的玻璃胶囊，高 40pt，2 秒后自动消失，只用来确认刚刚完成的操作（「已复制」「已保存」），文字用完成态，不放按钮。

```swift
HStack(alignment: .top, spacing: 10) {
    Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(.warning)
    VStack(alignment: .leading, spacing: 2) {
        Text("本月 AI 次数还剩 10%").font(.headline)
        Text("用完后可以继续写笔记，AI 功能会在 11 月 1 日恢复。")
            .foregroundStyle(.inkSecondary)
    }
}
.padding(.vertical, 8).padding(.horizontal, 12)
.frame(maxWidth: .infinity, alignment: .leading)
.background(.warningSoft, in: .rect(cornerRadius: 8))

// 轻提示
Label("已复制到剪贴板", systemImage: "checkmark.circle.fill")
    .padding(.horizontal, 16).frame(height: 40)
    .glassEffect(in: .capsule)
```

**不要**：一个页面同时出现多个横幅；用横幅打广告；错误信息只写「出错了」；轻提示里放需要用户处理的事情（那应该用横幅或弹窗）。

### 底部弹窗

从底部弹出的面板，用于一个短小、独立的任务：确认购买、编辑一个字段、选择分享方式。

**需要提供**：标题、一两句说明、内容（短表单或选项）、主操作和取消操作，以及要支持的高度档位。

**规格**

- iOS 26 上，系统会把中等高度的弹窗渲染成悬浮的玻璃面板，四周留出间距；拉到全高后变成不透明。直接使用系统样式，不要自己画背景。
- 顶部拖拽条 36×5pt，`line-control` 色。
- 标题用 `ios-title`（衬线），说明用 `ios-callout` `ink-secondary`，下方留 `space-4`。
- 主操作是通栏 46pt 胶囊主按钮（`control-ios-lg`），下面是同尺寸的文字按钮「暂不需要」，两者间距 `space-1`。
- 内容超过一屏，或需要长时间阅读时，改成全高弹窗或推入新页面，背景用 `canvas`。
- Mac 上对应的是附着在窗口上的 sheet 和系统 Alert，同样直接使用系统样式。

```swift
.sheet(isPresented: $showPaywall) {
    PaywallView()
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
}

// 确认删除这类二选一的决定，用系统对话框
.confirmationDialog("删除这条笔记？", isPresented: $confirmDelete) {
    Button("删除", role: .destructive) { delete() }
}
```

**不要**：在弹窗里再弹一个弹窗；把长篇文章放进玻璃弹窗；没有取消方式；把价格之类的关键信息藏在小字里。

## AI 对话

AI 的回答是要读的内容，所以放在纸面上、用衬线；执行过程让位于回答本身。

### 消息

对话里的一条消息。用户说的话放在凹下去的气泡里，AI 的回答直接排在纸面上，用衬线字体，像一页文章。

**需要提供**：发送者（用户或 AI）、内容（Markdown，可以包含代码块、列表、链接）、AI 消息的操作（复制、重新生成），以及生成中的状态。

**规格**

- 用户消息：靠右，最大宽度 80%，`surface-sunken` 底，`radius-lg`，内边距上下 6pt、左右 `space-3`；Mac 用 `mac-body`，iOS 用 `ios-callout`。
- AI 消息：靠左，不加气泡，正文用 `mac-prose` 或 `ios-prose`，栏宽不超过 `content-max`。代码见「代码块」，执行步骤见「执行步骤」。
- 消息之间间距 `space-4`，段落之间 `space-2`。
- 操作按钮放在 AI 消息下方，22pt 图标按钮，`ink-tertiary` 色，Mac 上只在悬停时显示，iOS 上一直显示。
- 链接用 `ink` 色，加 1pt 的 `line-control` 色下划线，下偏移 3pt。
- 生成中：回答末尾显示一个闪烁的光标，Composer 的发送按钮变成「停止」。

```swift
// 用户消息
Text(message.text)
    .padding(.vertical, 6).padding(.horizontal, 12)
    .background(.surfaceSunken, in: .rect(cornerRadius: 12))
    .frame(maxWidth: .infinity, alignment: .trailing)

// AI 消息：用 AttributedString(markdown:) 渲染，或接入 Markdown 渲染库
Text(try AttributedString(markdown: message.text))
    .font(.system(.body, design: .serif))
    .lineSpacing(4)
    .textSelection(.enabled)
    .frame(maxWidth: 680, alignment: .leading)
```

**不要**：给 AI 回答也加气泡；用头像区分谁在说话（靠位置和字体就够了）；在正文里用彩色强调文字（强调用加粗）。

### 执行步骤

一行显示一个执行步骤：做了什么、结果如何、用了多久。点开可以看到细节。用于 AI 的工具调用、导入导出、批量处理这类任务。

**需要提供**：状态（进行中 / 成功 / 失败）、动作名（2–4 个字的动词）、对象摘要（文件名、参数、结果）、耗时或说明；可选的详细内容，点击后展开。

**规格**

- 高 `control-mac`，`radius-sm`，悬停时底色 `fill-hover`。整行默认 `ink-secondary`，让位于正文内容。
- 状态图标 14pt：进行中是 `ink` 色的转圈，成功是 `success` 色，失败是 `danger` 色。失败时摘要要写清楚原因。
- 动作名 12pt 半粗 `ink`；摘要用 11pt 等宽，单行，在末尾截断；右侧耗时 11pt `ink-tertiary`。
- 展开后的详情缩进到和文字对齐，`surface-sunken` 底，`radius-sm`，12pt 等宽。
- 连续 3 步以上全部成功时，合并成一行「完成 5 个步骤」，点击后展开。

```swift
DisclosureGroup(isExpanded: $expanded) {
    Text(step.detail)
        .font(.system(.callout, design: .monospaced))
        .foregroundStyle(.inkSecondary)
        .padding(.vertical, 6).padding(.horizontal, 8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.surfaceSunken, in: .rect(cornerRadius: 6))
} label: {
    HStack(spacing: 7) {
        StatusGlyph(step.status)          // ProgressView / checkmark.circle / xmark.circle
        Text(step.action).fontWeight(.semibold).foregroundStyle(.ink)
        Text(step.summary).font(.callout.monospaced()).lineLimit(1)
        Spacer()
        Text(step.duration).font(.caption).monospacedDigit().foregroundStyle(.inkTertiary)
    }
    .foregroundStyle(.inkSecondary)
}
```

**不要**：把每一步都做成卡片；成功的步骤也用醒目的颜色；把原始日志直接铺在对话里（放进折叠详情）。
