# 任务清单

AI 或批量任务的计划和进度：一张描边卡片，每行一个任务，左边一个状态圈。放在对话里，随着进度原地更新，不重复发新的清单。

**需要提供**：任务列表（每项一句话，动词开头），每项的状态（待办 / 进行中 / 完成 / 失败）。

## 尺寸

<!-- tokens:task-list -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `task-row-height` | 28 | 44 | 32 | 任务清单每一行的高度。 |
| `task-glyph-size` | 16 | 20 | 18 | 左侧状态圈的直径。 |
<!-- /tokens -->

- 卡片：无底色（直接在内容区上），1px `line` 描边，`card-radius`，内边距上下 `space-3`、左右 `card-padding-x`。
- 每行高 `task-row-height`，文字 `type-body`、`ink`，状态圈和文字之间 `space-2`。
- 状态圈直径 `task-glyph-size`：
  - 待办：`ink-tertiary` 虚线圆圈。
  - 进行中：转圈，`ink` 色。同一时间只有一项在进行。
  - 完成：`ink-secondary` 的对勾圆圈，文字变 `ink-secondary`，不加删除线。
  - 失败：`danger` 的叉号圆圈，后面跟一句原因。
- 任务超过 8 项时，默认只显示进行中前后的几项，其余折叠成「还有 5 项」。

## Web

用 `role="list"`，进行中的一项加 `aria-current="step"`，读屏能知道进度。

```css
.dn-task-list {
  display: grid;
  margin: 0;
  padding: var(--space-3) var(--card-padding-x);
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--card-radius);
  list-style: none;
}
.dn-task { display: flex; align-items: center; gap: var(--space-2); min-height: var(--task-row-height); color: var(--ink); font: var(--type-body); }
.dn-task-glyph { flex: none; box-sizing: border-box; width: var(--task-glyph-size); height: var(--task-glyph-size); border: 1.5px var(--line-style-dropzone) var(--ink-tertiary); border-radius: var(--radius-full); }
.dn-task[aria-current="step"] .dn-task-glyph { border: 2px solid var(--line); border-top-color: var(--ink); animation: dn-task-spin 0.9s linear infinite; }
.dn-task.is-done { color: var(--ink-secondary); }
.dn-task.is-done .dn-task-glyph, .dn-task.is-failed .dn-task-glyph { border: 0; fill: none; stroke: currentColor; stroke-width: var(--icon-stroke); stroke-linecap: var(--line-cap); stroke-linejoin: var(--line-join); }
.dn-task.is-failed .dn-task-glyph { color: var(--danger); }
.dn-task-note { color: var(--ink-tertiary); font: var(--type-callout); }
@keyframes dn-task-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .dn-task[aria-current="step"] .dn-task-glyph { animation-duration: 2.4s; } }
```

```html
<ul class="dn-task-list" aria-label="任务">
  <li class="dn-task is-done"><svg class="dn-task-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>读取现有规范和设计变量</li>
  <li class="dn-task" aria-current="step"><span class="dn-task-glyph" aria-hidden="true"></span>按场景改写设计变量</li>
  <li class="dn-task"><span class="dn-task-glyph" aria-hidden="true"></span>更新组件说明和参考写法</li>
  <li class="dn-task is-failed"><svg class="dn-task-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>编译 Tailwind 主题<span class="dn-task-note">无法访问 npm</span></li>
</ul>
```

## SwiftUI

```swift
VStack(alignment: .leading, spacing: 0) {
    ForEach(tasks) { task in
        HStack(spacing: Deernova.space2) {
            TaskGlyph(task.status)            // 虚线圈 / ProgressView / checkmark.circle / xmark.circle
                .frame(width: Deernova.taskGlyphSize, height: Deernova.taskGlyphSize)
            Text(task.title)
                .foregroundStyle(task.status == .done ? .inkSecondary : .ink)
        }
        .font(.deernovaBody)
        .frame(minHeight: Deernova.taskRowHeight, alignment: .leading)
    }
}
.padding(.vertical, Deernova.space3)
.padding(.horizontal, Deernova.cardPaddingX)
.frame(maxWidth: .infinity, alignment: .leading)
.overlay(RoundedRectangle(cornerRadius: Deernova.cardRadius).strokeBorder(.line, lineWidth: Deernova.strokeLine))
```

## 不要

- 每次进度变化都发一张新清单（原地更新）。
- 用彩色区分待办和完成；给完成的任务加删除线。
- 同时显示多个“进行中”。
