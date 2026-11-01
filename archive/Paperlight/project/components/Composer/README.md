# Composer

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
