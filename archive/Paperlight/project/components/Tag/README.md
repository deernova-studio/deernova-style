# Tag

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
