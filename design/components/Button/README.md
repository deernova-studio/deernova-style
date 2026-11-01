# Button

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

// 放在玻璃层上时改用 .glassProminent / .glass，见 GlassControls
```

**不要**：一个视图里放两个主按钮；用「确定」「OK」做标签；按钮里写一整句话；为了强调把次要按钮也做成黑底。
