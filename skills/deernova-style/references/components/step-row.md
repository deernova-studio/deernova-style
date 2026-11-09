# 思考、工具调用与执行步骤

AI 在对话里想了什么、做了什么。思考和工具调用都是「过程」，平时各折叠成一行灰字，回答正文才是黑的，见 [AI 交互](../foundations/ai.md)。工具调用分两层：平时只显示一行灰色的**摘要**（「已运行 2 个命令，已读取 3 个文件」），点开才是逐条的**执行步骤**（做了什么、结果如何、用了多久）；正在做的事显示为**运行中**状态。也用于导入导出、批量处理这类任务。

**需要提供**：摘要文字（动词 + 数量）；每一步的状态（进行中 / 成功 / 失败）、动作名（2–4 个字的动词）、对象摘要（文件名、参数、结果）、耗时；可选的详细内容和缩略图；运行中的动作名和已用时间。

## 尺寸

没有自己的 token：行高用 `button-height-md`，图标用 `icon-size-md`。

- **摘要行**：`type-body` 字号、`ink-secondary`，末尾一个小箭头，点开后箭头转向下；悬停时文字变 `ink`。没有底色、没有边框，和正文段落之间 `space-4`。
- **执行步骤**：在摘要下方缩进，左边一条 1px `line`。每步高 `button-height-md`，`radius-sm`，悬停 `fill-hover`。状态图标：进行中是 `ink` 色的转圈，成功 `success`，失败 `danger`（失败时摘要写清楚原因）。动作名 `callout` 半粗 `ink`；对象摘要 `caption` 等宽、单行截断；耗时 `caption`、`ink-tertiary`、等宽数字。
- **步骤详情**：再点开一步，缩进到和文字对齐，`surface-sunken` 底，`radius-sm`，等宽。
- **运行中**：三个依次闪烁的圆点（`ink-secondary`）+ 动作名 + 已用时间（`ink-tertiary`），`type-body` 字号。减弱动态效果时圆点不闪。等待用户确认时改成「等待你确认」，圆点停止闪烁，见 [确认与审批](approval.md)。
- **更多状态**：等待确认是 `ink` 色的暂停图标；被拒绝、被跳过是 `ink-tertiary` 的斜线圆，动作名后写「已拒绝」；运行被停止时，还没完成的步骤显示 `ink-tertiary` 的方块和「已停止」。这些状态的步骤也留在原处，不删掉。
- **步骤详情的结构**：工具调用的详情分「输入」和「输出」两段，各有一个 `caption`、`ink-tertiary` 的小标题；输出很长时只显示前 20 行，末尾「显示全部 320 行」。

## 思考

- 思考完成后折叠成一行「已思考 12 秒」，样式和摘要行相同（`type-body`、`ink-secondary`、小箭头）；思考进行中，对话末尾的运行状态写「正在思考」和已用时间。
- 展开后是思考的文字：`callout` 字号、`ink-secondary`，左边一条 1px `line`，缩进和执行步骤一致；只做段落和列表，不显示大标题和表格。
- 默认折叠，不自动展开；思考很短（不到 1 秒）时不显示这一行。
- 思考和工具调用交替发生时，按先后顺序各占一行，不合并成一个大块。

## Web

用 `<details>` 和 `<summary>` 实现展开，键盘和读屏都能用；内容高度和箭头一起用 `duration-base` 过渡，见 [动效](../foundations/motion.md)。

```css
.dn-activity { min-width: 0; interpolate-size: allow-keywords; }
.dn-activity::details-content { block-size: 0; overflow: clip; transition: block-size var(--duration-base) var(--ease-standard), content-visibility var(--duration-base) allow-discrete; }
.dn-activity[open]::details-content { block-size: auto; }
@media (prefers-reduced-motion: reduce) { .dn-activity::details-content { transition: none; } }
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
.dn-step.is-waiting .dn-step-glyph { color: var(--ink); }
.dn-step.is-skipped, .dn-step.is-skipped .dn-step-name { color: var(--ink-tertiary); }
.dn-step-detail-label { display: block; margin: 0 0 2px; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); }
.dn-step-detail-label + * + .dn-step-detail-label { margin-top: var(--space-2); }
.dn-activity > .dn-thinking { margin: var(--space-1) 0 0 6px; padding-left: var(--space-3); border-left: var(--stroke-line) solid var(--line); color: var(--ink-secondary); font: var(--type-callout); }
.dn-thinking p { margin: 0 0 var(--space-2); }
.dn-thinking p:last-child { margin-bottom: 0; }
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
  <details class="dn-activity">
    <summary>已思考 12 秒<svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></summary>
    <div class="dn-thinking"><p>用户要三条要点。先读周报草稿，确认有哪些进展，再对照上周的周报去掉重复的内容。</p><p>测试结果也要一起看，避免把还没通过的修复写成已完成。</p></div>
  </details>
  <details class="dn-activity" open>
    <summary>已运行 2 个命令，已读取 1 个文件<svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></summary>
    <div class="dn-steps">
      <div class="dn-step is-success"><svg class="dn-icon dn-step-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg><span class="dn-step-name">读取</span><span class="dn-step-summary">周报草稿.md</span><span class="dn-step-meta">0.4 秒</span></div>
      <details open>
        <summary class="dn-step is-success"><svg class="dn-icon dn-step-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg><span class="dn-step-name">运行</span><span class="dn-step-summary">npm test</span><span class="dn-step-meta">12.3 秒</span></summary>
        <div class="dn-step-detail"><span class="dn-step-detail-label">输入</span><div>npm test</div><span class="dn-step-detail-label">输出</span><div>tests 63 · pass 63 · fail 0</div></div>
      </details>
      <div class="dn-step is-failed"><svg class="dn-icon dn-step-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg><span class="dn-step-name">运行</span><span class="dn-step-summary">npm run lint：找不到 eslint 配置</span><span class="dn-step-meta">已跳过</span></div>
    </div>
  </details>
  <div class="dn-steps">
    <div class="dn-step is-waiting"><svg class="dn-icon dn-step-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/></svg><span class="dn-step-name">写入</span><span class="dn-step-summary">docs/weekly.md</span><span class="dn-step-meta">等待你确认</span></div>
    <div class="dn-step is-skipped"><svg class="dn-icon dn-step-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M6 18L18 6"/></svg><span class="dn-step-name">推送</span><span class="dn-step-summary">git push origin main</span><span class="dn-step-meta">已拒绝</span></div>
  </div>
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
- 把思考过程默认展开，或者用和正文一样的黑色排版；把被拒绝、被停止的步骤从记录里删掉。
