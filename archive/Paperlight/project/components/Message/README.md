# Message

对话里的一条消息。用户说的话放在凹下去的气泡里，AI 的回答直接排在纸面上，用衬线字体，像一页文章。

**需要提供**：发送者（用户或 AI）、内容（Markdown，可以包含代码块、列表、链接）、AI 消息的操作（复制、重新生成），以及生成中的状态。

**规格**

- 用户消息：靠右，最大宽度 80%，`surface-sunken` 底，`radius-lg`，内边距上下 6pt、左右 `space-3`；Mac 用 `mac-body`，iOS 用 `ios-callout`。
- AI 消息：靠左，不加气泡，正文用 `mac-prose` 或 `ios-prose`，栏宽不超过 `content-max`。代码块用 CodeBlock，执行步骤用 StepRow。
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
