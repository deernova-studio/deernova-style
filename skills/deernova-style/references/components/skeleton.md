# 加载状态

等待时给用户什么看：加载动效、骨架和进度条。原则是让人知道「正在进行」以及「大概还要多久」，同时不让布局在加载完成时跳动。

**需要提供**：要等待的内容的大致形状（几行、几张卡片、一张表），能不能知道进度，预计时长。

## 先选对样式

| 情况 | 用 | 位置 |
| --- | --- | --- |
| 按钮触发的短操作（不到 2 秒） | 按钮里的 `spinner` 动效，按钮宽度不变 | 按钮里，见[按钮](button.md) |
| 内容区第一次加载，知道大致形状 | 骨架 | 内容原本的位置 |
| AI 正在思考、正在运行工具 | `thinking` 或 `working` 动效加一句状态 | 对话末尾的运行状态行，见[思考、工具调用与执行步骤](step-row.md) |
| 列表里、侧边栏里某一项正在进行 | `spinner` 动效 | 那一项的图标位置 |
| 知道进度的长任务（上传、导出、索引） | 确定进度条 + 百分比或剩余时间 | 任务所在的位置 |
| 不知道进度、但会持续一会儿（翻页、刷新） | 不确定进度条，细细一条 | 区域顶部 |

## 尺寸

<!-- tokens:skeleton -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `skeleton-line-height` | 12 | 14 | 12 | 骨架里每一行文字块的高度。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `progress-height` | `4px` | 进度条的高度。 |
| `shimmer-duration` | `1600ms` | 骨架微光和文字微光扫过一次的时间。（仅网页） |
<!-- /tokens -->

- **骨架**：`fill-selected` 底的圆角块，形状照着真实内容画：文字行高 `skeleton-line-height`、圆角 `radius-xs`，最后一行短一些（60%）；头像、图标画成圆；卡片画成卡片的轮廓。上面有一道缓慢移动的微光，周期 `shimmer-duration`。
- **文字微光**：用在「正在思考」这类运行状态的文字上：文字本身是 `ink-tertiary`，一道 `ink-secondary` 的亮带从左到右扫过，周期同上。
- **进度条**：高 `progress-height`、`radius-full`，底是 `fill-selected`，已完成部分 `accent`；旁边写百分比或「还剩约 2 分钟」（`caption`、等宽数字）。不确定进度时，一段 30% 长的 `accent` 在轨道上来回移动。
- **文字微光**只用在放不下动效、又需要表示「正在生成」的文字上，例如侧边栏里正在生成的会话标题；AI 运行状态行用动效，不再给文字加微光（一处在动就够了）。

## 加载动效

来自 `@deernova/loaders`：一笔单色的线沿着数学曲线走，尾巴逐渐变细，后面是很淡的完整曲线。网格和描边与[图标](../foundations/iconography.md)相同（24×24、1.75），颜色跟随文字。

| 名字 | 用在 | 曲线 | 停下后 |
| --- | --- | --- | --- |
| `thinking` | AI 正在思考：对话末尾的运行状态行 | 三瓣玫瑰线，5.2 秒一圈 | 落成 `thinking` 图标，就是「已思考 12 秒」前面那个图标 |
| `working` | AI 正在运行工具：对话末尾的运行状态行 | ∞（1:2 利萨如曲线），3 秒一圈 | 停下后换成步骤结果 |
| `spinner` | 其他所有加载：按钮里、正在进行的步骤和任务、侧边栏会话、远程搜索、重新连接 | 圆，0.9 秒一圈 | 消失 |

- **曲线只给 AI 的运行状态**：`thinking`、`working` 只出现在对话末尾的运行状态行，同一屏最多一个；列表、按钮、侧边栏里正在进行的一项都用 `spinner`。这样曲线就是「AI 在工作」的标志。
- **等待用户时不动**：等待确认、等待回答时不放动效，显示 `waiting` 图标。
- **停下要用 stop()**：思考结束时调用 `stop()`（或给 `<dn-loader>` 加 `done` 属性），线在 240ms 内补满曲线、粗细变均匀，停在图标上；不要直接删掉再放一个图标。
- **尺寸**：默认 `icon-size-md`，按钮里 `icon-size-sm`，任务清单里同状态圈；用 `--loader-size` 改。颜色默认继承文字，运行状态行里是 `ink-secondary`，进行中的步骤和任务是 `ink`。
- 动效对读屏隐藏，状态写在旁边的文字里（放在 `role="status"` 的容器中）。

## 规则

- **等一下再出现**：预计很快的操作，300ms 内完成就不显示加载状态；一旦出现，至少显示 500ms，避免一闪而过。
- **骨架和真实内容一样大**：加载完成时内容原地替换骨架，位置不跳；骨架不超过一屏，不画细节（不画按钮上的字）。
- **一个区域只用一种**：不要在骨架上再叠转圈；页面级只出现一个加载状态，局部更新用局部的。
- **超过预期就说明**：等待超过 10 秒时，在加载状态旁边补一句说明（「文件较大，还需要一会儿」）；可以取消的任务给一个「取消」。
- **失败**：在原位置换成一句原因和「重试」，不弹窗。
- **减弱动态效果**：微光和来回移动的进度条停止，骨架保持静止的 `fill-selected` 底，进度条只显示数字；`spinner` 放慢到 2.4 秒一圈，`thinking`、`working` 直接显示静止的完整曲线（包里已经处理）。

## Web

加载动效用自定义元素 `<dn-loader name="thinking">`：项目里 `import { defineLoaderElement } from '@deernova/loaders'` 后调用一次 `defineLoaderElement()`；需要手动控制时用 `createLoader(容器, 'thinking')`，它返回 `stop()` 和 `destroy()`。

骨架区域加 `aria-busy="true"`，并用一个视觉隐藏的文字（「正在加载」）告诉读屏；加载完成后去掉 `aria-busy`。进度条用 `<progress>` 或 `role="progressbar"` 加 `aria-valuenow`。

```css
dn-loader { display: inline-grid; flex: none; place-items: center; }
dn-loader > .dn-loader { width: var(--loader-size, var(--icon-size-md)); height: var(--loader-size, var(--icon-size-md)); }
.dn-button dn-loader { --loader-size: var(--icon-size-sm); }
.dn-skeleton { display: grid; gap: var(--space-2); }
.dn-skeleton-line, .dn-skeleton-block, .dn-skeleton-dot {
  background: var(--fill-selected) linear-gradient(90deg, transparent 0%, var(--fill-hover) 40%, var(--fill-selected) 50%, var(--fill-hover) 60%, transparent 100%) no-repeat;
  background-size: 200% 100%;
  animation: dn-shimmer var(--shimmer-duration) linear infinite;
}
.dn-skeleton-line { height: var(--skeleton-line-height); border-radius: var(--radius-xs); }
.dn-skeleton-line:last-child { width: 60%; }
.dn-skeleton-block { border-radius: var(--card-radius); }
.dn-skeleton-dot { flex: none; width: var(--icon-size-lg); height: var(--icon-size-lg); border-radius: var(--radius-full); }
.dn-skeleton-row { display: flex; align-items: center; gap: var(--space-3); }
.dn-skeleton-row > .dn-skeleton { flex: 1; }
@keyframes dn-shimmer { from { background-position: 150% 0; } to { background-position: -50% 0; } }
.dn-shimmer-text {
  background: linear-gradient(90deg, var(--ink-tertiary) 0%, var(--ink-tertiary) 40%, var(--ink-secondary) 50%, var(--ink-tertiary) 60%, var(--ink-tertiary) 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: dn-shimmer var(--shimmer-duration) linear infinite;
}
.dn-progress { display: flex; align-items: center; gap: var(--space-3); }
.dn-progress-track { position: relative; flex: 1; height: var(--progress-height); overflow: hidden; border-radius: var(--radius-full); background: var(--fill-selected); }
.dn-progress-bar { --value: 40%; width: var(--value); height: 100%; border-radius: inherit; background: var(--accent); transition: width var(--duration-base) var(--ease-standard); }
.dn-progress-track.is-indeterminate .dn-progress-bar { position: absolute; width: 30%; animation: dn-progress var(--shimmer-duration) var(--ease-standard) infinite alternate; }
@keyframes dn-progress { from { left: 0; } to { left: 70%; } }
.dn-progress-label { flex: none; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) {
  .dn-skeleton-line, .dn-skeleton-block, .dn-skeleton-dot, .dn-shimmer-text, .dn-progress-track.is-indeterminate .dn-progress-bar { animation: none; }
  .dn-shimmer-text { color: var(--ink-tertiary); background: none; }
}
```

```html
<div class="dn-stack">
  <div class="dn-skeleton-row" aria-busy="true" aria-label="正在加载">
    <span class="dn-skeleton-dot"></span>
    <div class="dn-skeleton"><span class="dn-skeleton-line"></span><span class="dn-skeleton-line"></span></div>
  </div>
  <div class="dn-skeleton" aria-busy="true" aria-label="正在加载">
    <span class="dn-skeleton-line"></span><span class="dn-skeleton-line"></span><span class="dn-skeleton-line"></span>
  </div>
  <div class="dn-running" role="status"><dn-loader name="thinking"></dn-loader>正在思考<span class="dn-running-time">8 秒</span></div>
  <div class="dn-running" role="status"><dn-loader name="working"></dn-loader>正在运行 命令<span class="dn-running-time">npm test</span></div>
  <div class="dn-row"><button class="dn-button is-primary" type="button" aria-busy="true" disabled><dn-loader name="spinner"></dn-loader>正在保存</button><span class="dn-running"><dn-loader name="spinner"></dn-loader>正在搜索</span></div>
  <div class="dn-progress"><div class="dn-progress-track" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" aria-label="上传进度"><div class="dn-progress-bar"></div></div><span class="dn-progress-label">40% · 还剩约 2 分钟</span></div>
  <div class="dn-progress"><div class="dn-progress-track is-indeterminate" role="progressbar" aria-label="正在刷新"><div class="dn-progress-bar"></div></div></div>
</div>
```

真实页面里，进度条用脚本把 `--value` 设成当前百分比。

## SwiftUI

普通加载用系统的 `ProgressView()`；`thinking`、`working` 按 `@deernova/loaders` README 里的曲线公式和参数，用 `TimelineView(.animation)` 加 `Canvas` 画，减弱动态效果时画静止的完整曲线。骨架用真实的视图加 `.redacted(reason: .placeholder)`，系统会按内容画出灰块；需要微光时在上面叠一个移动的渐变遮罩，减弱动态效果时去掉。进度用 `ProgressView(value:)`（确定）和 `ProgressView()`（转圈），用 `.tint(.brandAccent)`。

## 不要

- 整页白屏加一个大转圈；骨架画得比真实内容复杂。
- 很快的操作也闪一下加载状态；加载完成时内容跳动。
- 在骨架上再叠加载动效；同一屏出现好几个转圈，或者两个曲线动效。
- 把 `thinking`、`working` 用在按钮、列表或普通页面加载上；等待用户确认时还放着动效。
- 用彩色的进度条或彩色的微光。
