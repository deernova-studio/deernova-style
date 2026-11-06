# 工具调用与执行步骤

AI 在对话里做了什么。分两层：平时只显示一行灰色的**摘要**（「已运行 2 个命令，已读取 3 个文件」），点开才是逐条的**执行步骤**（做了什么、结果如何、用了多久）；正在做的事显示为**运行中**状态。也用于导入导出、批量处理这类任务。

**需要提供**：摘要文字（动词 + 数量）；每一步的状态（进行中 / 成功 / 失败）、动作名（2–4 个字的动词）、对象摘要（文件名、参数、结果）、耗时；可选的详细内容和缩略图；运行中的动作名和已用时间。

## 尺寸

没有自己的 token：行高用 `button-height-md`，图标用 `icon-size-md`。

- **摘要行**：`type-body` 字号、`ink-secondary`，末尾一个小箭头，点开后箭头转向下；悬停时文字变 `ink`。没有底色、没有边框，和正文段落之间 `space-4`。
- **执行步骤**：在摘要下方缩进，左边一条 1px `line`。每步高 `button-height-md`，`radius-sm`，悬停 `fill-hover`。状态图标：进行中是 `ink` 色的转圈，成功 `success`，失败 `danger`（失败时摘要写清楚原因）。动作名 `callout` 半粗 `ink`；对象摘要 `caption` 等宽、单行截断；耗时 `caption`、`ink-tertiary`、等宽数字。
- **步骤详情**：再点开一步，缩进到和文字对齐，`surface-sunken` 底，`radius-sm`，等宽。
- **运行中**：三个依次闪烁的圆点（`ink-secondary`）+ 动作名 + 已用时间（`ink-tertiary`），`type-body` 字号。减弱动态效果时圆点不闪。

## Web

用 `<details>` 和 `<summary>` 实现展开，键盘和读屏都能用。

```css
.dn-activity { min-width: 0; }
.dn-activity > summary {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  min-height: var(--button-height-md);
  color: var(--ink-secondary);
  font: var(--type-body);
  list-style: none;
  cursor: pointer;
}
.dn-activity > summary::-webkit-details-marker { display: none; }
@media (hover: hover) { .dn-activity > summary:hover { color: var(--ink); } }
.dn-activity > summary .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); transition: transform var(--duration-base) var(--ease-standard); }
.dn-activity[open] > summary .dn-icon { transform: rotate(90deg); }
.dn-activity > .dn-steps { margin: var(--space-1) 0 0 6px; padding-left: var(--space-3); border-left: var(--stroke-line) solid var(--line); }

.dn-steps { display: flex; flex-direction: column; min-width: 0; }
.dn-step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  height: var(--button-height-md);
  padding: 0 6px;
  border-radius: var(--radius-sm);
  color: var(--ink-secondary);
  font: var(--weight-regular) var(--type-callout-size)/1 var(--font-sans);
  list-style: none;
}
.dn-step::-webkit-details-marker { display: none; }
details > .dn-step { cursor: pointer; }
@media (hover: hover) { .dn-step:hover { background: var(--fill-hover); } }
.dn-step:active { background: var(--fill-selected); }
.dn-step .dn-icon { width: var(--icon-size-md); height: var(--icon-size-md); }
.dn-step-name { color: var(--ink); font-weight: var(--weight-semibold); white-space: nowrap; }
.dn-step-summary { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: var(--weight-regular) var(--type-caption-size)/1 var(--font-mono); }
.dn-step-meta { margin-left: auto; padding-left: var(--space-2); color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); font-variant-numeric: tabular-nums; white-space: nowrap; }
.dn-step.is-success .dn-step-glyph { color: var(--success); }
.dn-step.is-failed .dn-step-glyph { color: var(--danger); }
.dn-step-detail {
  margin: 2px 0 6px calc(6px + var(--icon-size-md) + var(--space-2));
  padding: 6px var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--surface-sunken);
  color: var(--ink-secondary);
  font: var(--weight-regular) var(--type-caption-size)/1.45 var(--font-mono);
  white-space: pre-wrap;
}
.dn-spinner { flex: none; width: var(--icon-size-sm); height: var(--icon-size-sm); border: 2px solid var(--line); border-top-color: var(--ink); border-radius: var(--radius-full); animation: dn-spin 0.9s linear infinite; }
@keyframes dn-spin { to { transform: rotate(360deg); } }

.dn-running { display: flex; align-items: center; gap: var(--space-2); min-height: var(--button-height-md); color: var(--ink-secondary); font: var(--type-body); }
.dn-running-dots { display: inline-flex; gap: 3px; }
.dn-running-dots span { width: 4px; height: 4px; border-radius: var(--radius-full); background: currentColor; animation: dn-blink 1.2s var(--ease-standard) infinite; }
.dn-running-dots span:nth-child(2) { animation-delay: 0.2s; }
.dn-running-dots span:nth-child(3) { animation-delay: 0.4s; }
.dn-running-time { color: var(--ink-tertiary); font-variant-numeric: tabular-nums; }
@keyframes dn-blink { 0%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .dn-spinner { animation-duration: 2.4s; }
  .dn-running-dots span { animation: none; opacity: 0.6; }
}
```

```html
<div class="dn-stack">
  <details class="dn-activity" open>
    <summary>已运行 2 个命令，已读取 1 个文件<svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></summary>
    <div class="dn-steps">
      <div class="dn-step is-success"><svg class="dn-icon dn-step-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg><span class="dn-step-name">读取</span><span class="dn-step-summary">周报草稿.md</span><span class="dn-step-meta">0.4 秒</span></div>
      <details open>
        <summary class="dn-step is-success"><svg class="dn-icon dn-step-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg><span class="dn-step-name">运行</span><span class="dn-step-summary">npm test</span><span class="dn-step-meta">12.3 秒</span></summary>
        <div class="dn-step-detail">tests 63 · pass 63 · fail 0</div>
      </details>
      <div class="dn-step is-failed"><svg class="dn-icon dn-step-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg><span class="dn-step-name">运行</span><span class="dn-step-summary">npm run lint：找不到 eslint 配置</span><span class="dn-step-meta">已跳过</span></div>
    </div>
  </details>
  <div class="dn-running" role="status"><span class="dn-running-dots" aria-hidden="true"><span></span><span></span><span></span></span>正在运行 命令<span class="dn-running-time">42 秒</span></div>
</div>
```

## SwiftUI

```swift
// 摘要行：点开后是逐条的执行步骤
DisclosureGroup(isExpanded: $expanded) {
    ForEach(steps) { step in StepRow(step: step) }
        .padding(.leading, Deernova.space3)
} label: {
    Text("已运行 \(commands) 个命令，已读取 \(files) 个文件")
        .font(.deernovaBody).foregroundStyle(.inkSecondary)
}

struct StepRow: View {
    var step: Step
    var body: some View {
        HStack(spacing: Deernova.space2) {
            StatusGlyph(step.status)          // ProgressView / checkmark.circle / xmark.circle
            Text(step.action).fontWeight(.semibold).foregroundStyle(.ink)
            Text(step.summary).font(.caption.monospaced()).lineLimit(1)
            Spacer()
            Text(step.duration).font(.caption).monospacedDigit().foregroundStyle(.inkTertiary)
        }
        .font(.deernovaCallout)
        .foregroundStyle(.inkSecondary)
        .frame(minHeight: Deernova.buttonHeightMd)
    }
}
```

## 不要

- 把每一步都做成卡片，或者默认把所有步骤展开铺在对话里。
- 成功的步骤也用醒目的颜色。
- 把原始日志直接铺在对话里（放进折叠详情）。
