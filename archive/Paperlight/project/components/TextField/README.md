# TextField

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

iOS 设置页这类表单，直接在 `Form` 里用 `TextField`，交给系统的分组样式（见 ListGroup）。

**不要**：只用占位符代替标签；出错时只把边框变红、不给说明；把多行输入塞进单行框（多行用 `TextField(axis: .vertical)` 或 Composer）。
