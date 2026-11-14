# 卡片

卡片把一条内容的摘要装进一个可以点开的块里，用于网格和看板。

**需要提供**：标题、一行元信息（时间、分类、状态[标签](tag.md)，最多 3 项），点击后打开详情。标题说不清内容时才加摘要。

## 尺寸

<!-- tokens:card -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `card-padding-x` | 16 | 16 | 24 | 卡片左右内边距。 |
| `card-padding-y` | 12 | 14 | 24 | 卡片上下内边距。 |
| `card-radius` | 12 | 12 | 12 | 卡片、分组列表、任务清单的圆角。 |
| `card-gap` | 12 | 12 | 16 | 卡片网格的间距。 |
<!-- /tokens -->

- `surface` 底、1px（`stroke-line`）`line` 描边，不加阴影，圆角 `card-radius`。
- 标题用 `type-headline`（无衬线、半粗）；摘要用 `footnote`、`ink-secondary`，最多 2 行；元信息用 `caption`、`ink-tertiary`。内部间距 `space-1`。
- 卡片里不放装饰图标、「了解更多」链接和装饰性徽标；整张卡片可点就够了。
- 悬停时描边加深为 `line-control`。选中时用 `fill-selected` 底色，保持原有 `line` 边线；用键盘聚焦时画焦点环，底色不变。
- 网格间距 `card-gap`；每张卡片高度由内容决定，同一行顶部对齐。

## Web

整张卡片可点时，用 `<a>` 或 `<button>` 包住整张卡片，不要在卡片里再放一个主按钮。

```css
.dn-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--card-gap); align-items: start; }
.dn-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  position: relative;
  isolation: isolate;
  padding: var(--card-padding-y) var(--card-padding-x);
  border-radius: var(--card-radius);
  color: var(--ink);
  text-decoration: none;
}
/* 底色和描边画在 ::after 上：可点的卡片按下时只缩它，文字不动，写法同按钮 */
.dn-card::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border: var(--stroke-line) solid var(--line);
  border-radius: inherit;
  background-color: var(--surface);
  transition: border-color var(--duration-instant) var(--ease-standard), transform var(--duration-release) var(--ease-release);
}
@media (hover: hover) { :is(a, button).dn-card:hover::after { border-color: var(--line-control); } }
@media (prefers-reduced-motion: no-preference) {
  :is(a, button).dn-card:active::after { transform: scale(var(--press-scale)); transition: border-color var(--duration-instant) var(--ease-standard), transform var(--duration-press) var(--ease-standard); }
}
.dn-card:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset); }
.dn-card:is([aria-current="true"], .is-selected)::after { border-color: var(--line); background-image: linear-gradient(var(--fill-selected), var(--fill-selected)); }
.dn-card-title { margin: 0; font: var(--type-headline); }
.dn-card-summary {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--ink-secondary);
  font: var(--type-footnote);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.dn-card-meta { display: flex; align-items: center; gap: 6px; margin-top: 2px; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); font-variant-numeric: tabular-nums; }
```

```html
<div class="dn-card-grid">
  <a class="dn-card" href="#"><h3 class="dn-card-title">本周回顾</h3><p class="dn-card-summary">完成 12 条笔记，整理了两个项目的待办。</p><div class="dn-card-meta">今天 09:41</div></a>
  <a class="dn-card is-selected" href="#" aria-current="true"><h3 class="dn-card-title">读书摘录</h3><p class="dn-card-summary">好的工具会退到背景里，让人只看见自己的工作。</p><div class="dn-card-meta">昨天</div></a>
  <a class="dn-card" href="#"><h3 class="dn-card-title">旅行清单</h3><p class="dn-card-summary">护照、转换插头、两本书、一件薄外套。</p><div class="dn-card-meta">10 月 28 日</div></a>
</div>
```

## SwiftUI

```swift
VStack(alignment: .leading, spacing: Deernova.space1) {
    Text(note.title).font(.deernovaHeadline)
    Text(note.summary).font(.deernovaFootnote).foregroundStyle(.inkSecondary).lineLimit(2)
    Text(note.date, format: .relative(presentation: .named))
        .font(.caption).foregroundStyle(.inkTertiary)
}
.padding(.horizontal, Deernova.cardPaddingX)
.padding(.vertical, Deernova.cardPaddingY)
.frame(maxWidth: .infinity, alignment: .leading)
.background(isSelected ? Color.fillSelected : Color.surface, in: .rect(cornerRadius: Deernova.cardRadius))
.overlay(
    RoundedRectangle(cornerRadius: Deernova.cardRadius)
        .strokeBorder(.line, lineWidth: Deernova.strokeLine)
)
```

## 不要

- 给卡片加阴影或玻璃效果。
- 在卡片左侧加一条彩色竖条。
- 卡片里套卡片；一张卡片里放多个主按钮。
