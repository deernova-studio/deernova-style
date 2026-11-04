# 标签

一到四个字的标签，标出状态或分类，放在标题旁边或元信息里。

**需要提供**：文字、语气（中性 / 强调 / success / warning / danger / info）；表示状态时加一个圆点。

## 尺寸

<!-- tokens:tag -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `tag-height` | 20 | 22 | 24 | 标签高度。 |
| `tag-padding-x` | 6 | 8 | 10 | 标签左右内边距。 |
| `tag-font-size` | 12 | 12 | 12 | 标签字号。 |
| `tag-radius` | 4 | 胶囊 | 胶囊 | 标签圆角。 |
<!-- /tokens -->

- 中性标签：`fill-selected` 底、`ink-secondary` 字。
- 强调标签：`accent` 底、`on-accent` 字，只用于「新」「Pro」这类需要跳出来的少数标记。
- 有语气的标签：对应的 `-soft` 作底色，语气色作文字和圆点，例如 `success-soft` 底配 `success` 字。
- 表示状态时一定加 5px 圆点，文字本身就要说清楚状态是什么，不能只靠颜色。

## Web

```css
.dn-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  height: var(--tag-height);
  padding: 0 var(--tag-padding-x);
  border-radius: var(--tag-radius);
  background: var(--fill-selected);
  color: var(--ink-secondary);
  font: var(--weight-medium) var(--tag-font-size)/1 var(--font-sans);
  white-space: nowrap;
}
.dn-tag.is-accent { background: var(--accent); color: var(--on-accent); }
.dn-tag.is-success { background: var(--success-soft); color: var(--success); }
.dn-tag.is-warning { background: var(--warning-soft); color: var(--warning); }
.dn-tag.is-danger { background: var(--danger-soft); color: var(--danger); }
.dn-tag.is-info { background: var(--info-soft); color: var(--info); }
.dn-dot { flex: none; width: 5px; height: 5px; border-radius: var(--radius-full); background: currentColor; }
```

```html
<div class="dn-row">
  <span class="dn-tag">草稿</span>
  <span class="dn-tag is-accent">新</span>
  <span class="dn-tag is-success"><span class="dn-dot"></span>已同步</span>
  <span class="dn-tag is-warning"><span class="dn-dot"></span>即将到期</span>
  <span class="dn-tag is-danger"><span class="dn-dot"></span>同步失败</span>
  <span class="dn-tag is-info">测试版</span>
</div>
```

## SwiftUI

```swift
struct Tag: View {
    var text: LocalizedStringKey
    var tone: Color = .inkSecondary
    var background: Color = .fillSelected
    var showsDot = false

    var body: some View {
        HStack(spacing: Deernova.space1) {
            if showsDot { Circle().frame(width: 5, height: 5) }
            Text(text)
        }
        .font(.system(size: Deernova.tagFontSize, weight: .medium))
        .foregroundStyle(tone)
        .padding(.horizontal, Deernova.tagPaddingX)
        .frame(height: Deernova.tagHeight)
        .background(background, in: .rect(cornerRadius: min(Deernova.tagRadius, Deernova.tagHeight / 2)))
    }
}

Tag(text: "已同步", tone: .success, background: .successSoft, showsDot: true)
```

## 不要

- 用标签当按钮。
- 一行里放超过三个标签。
- 大量使用强调标签（它和主按钮长得像，多了就分不清）。
