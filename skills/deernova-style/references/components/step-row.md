# 思考、工具调用与执行步骤

AI 在对话里想了什么、做了什么。思考和工具调用都是「过程」，平时各折叠成一行灰字，回答正文才是黑的，见 [AI 交互](../foundations/ai.md)。工具调用分两层：平时只显示一行灰色的**摘要**（「已运行 2 个命令，已读取 3 个文件」），点开才是逐条的**执行步骤**（做了什么、结果如何、用了多久）；正在做的事显示为**运行中**状态。也用于导入导出、批量处理这类任务。

**需要提供**：摘要文字（动词 + 数量）；每一步的状态（进行中 / 成功 / 失败）、动作名（2–4 个字的动词）、对象摘要（文件名、参数、结果）、耗时；可选的详细内容和缩略图；运行中的动作名和已用时间。

## 尺寸

行高用 `button-height-md`，图标用 `icon-size-md`；工具详情另有两个：

<!-- tokens:step-row -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `tool-key-width` | 88 | 96 | 96 | 工具详情预览里参数名一栏的宽度，超长时截断。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `tool-detail-max-height` | `320px` | 工具详情（预览或 JSON）的最大高度，超出时在块内滚动。 |
<!-- /tokens -->

- **摘要行**：`type-body` 字号、`ink-secondary`；前面一个 `icon-size-md` 的图标（思考是 `thinking`，工具调用是 `tool`），末尾一个小箭头，点开后箭头转向下；悬停时文字变 `ink`。没有底色、没有边框，和正文段落之间 `space-4`。
- **执行步骤**：在摘要下方缩进，左边一条 1px `line`。每步高 `button-height-md`，`radius-sm`，悬停 `fill-hover`。状态图标：进行中是 `spinner` 动效（`ink`），成功 `success`，失败 `danger`（失败时摘要写清楚原因）。动作名 `callout` 半粗 `ink`；对象摘要 `caption` 等宽、单行截断；耗时 `caption`、`ink-tertiary`、等宽数字。
- **步骤详情**：再点开一步，缩进到和文字对齐，`surface-sunken` 底，`radius-sm`。默认显示可读的**预览**，原始数据放在 **JSON** 视图里，见下面的[工具详情](#工具详情)。
- **运行中**：对话末尾一行：加载动效（思考时 `thinking`，运行工具时 `working`，见[加载状态](skeleton.md)）+ 动作名 + 已用时间（`ink-tertiary`），`type-body`、`ink-secondary`。思考结束时动效停下，正好落成摘要行前面的 `thinking` 图标。等待用户确认时改成「等待你确认」，动效换成 `waiting` 图标，见 [确认与审批](approval.md)。
- **更多状态**：等待确认是 `ink` 色的暂停图标；被拒绝、被跳过是 `ink-tertiary` 的斜线圆，动作名后写「已拒绝」；运行被停止时，还没完成的步骤显示 `ink-tertiary` 的方块和「已停止」。这些状态的步骤也留在原处，不删掉。

## 步骤行怎么写

步骤行给人看，不是给开发者看。工具的原始名字和参数 JSON 都不出现在这一行。

- **动作名**：把工具翻译成 2–4 个字的动词：读取、修改、搜索、运行、委派、查询。认识的工具用固定的译名；不认识的 MCP 工具，用它自己声明的标题（`title`），没有就把名字拆成词（`delegate_task` →「delegate task」），不要显示 `mcp.herd.delegate_task` 这种全名。
- **对象摘要**：只放最能说明这一步的那一个参数：文件路径、搜索词、命令、委派任务的第一句、接收方的名字。写成「DSH · 第 20 轮成语接龙」，不要写成 `{"server":"herd","tool":…`。
- 工具的原名（`herd · delegate_task`）放进详情的左上角，需要的人点开能看到。

## 工具详情

点开一步后的内容分两种视图，右上角用一个小的「预览 / JSON」切换，旁边是复制按钮。

### 预览（默认）

- **结构**：上面是参数，一条 `line` 细线，下面是结果。每一项排成两列：左边参数名，`caption`、`ink-tertiary`，栏宽 `tool-key-width`，超长截断；右边是值，`callout`、`ink`，按正文排，不用等宽。两列首行对齐。
- **值怎么显示**：
  - 普通文字照常换行；超过两行时只显示两行，下面是「展开全部 · 312 字」文字按钮。
  - ID、路径、命令、哈希这类机器值用等宽 `caption`、`ink-secondary`；很长的 ID 截成前 8 位和后 4 位（`afa13cc4…442a`），完整值在 JSON 里。
  - 嵌套的对象和数组不在预览里展开，写成「3 项」，要看去 JSON。
  - 布尔值写成人话（「已接受」「否」），空值不显示这一项。
- **结果**：先写最重要的一句，用 `ink`；状态和用时写在下一项，`ink-secondary`。工具返回的外层包装（MCP 的 `content: [{ type: "text", text: … }]`）不显示，直接显示里面的内容；里面如果又是 JSON 字符串，先解析再按上面的规则显示。
- **常见工具的专门预览**（其他工具都用上面的通用两列）：

| 工具 | 参数 | 结果 |
| --- | --- | --- |
| 委派给另一个代理 | 接收方、任务（两行截断） | 对方的回复，按正文排；状态（已接受、已拒绝） |
| 运行命令 | 命令（等宽） | 输出的**最后** 20 行（出错信息通常在末尾），等宽；退出码不为 0 时写在第一行 |
| 读取文件 | 路径和行号范围 | 前 8 行内容，带行号，样式同[代码块](code-block.md) |
| 修改文件 | 路径 | 变更对比，样式同[确认与审批](approval.md)里的 `.dn-diff`，最多 20 行 |
| 搜索 | 搜索词 | 结果列表：每条一行标题加 `caption` 的来源，最多 5 条，末尾「还有 12 条」 |

- **失败**：结果区第一项是「错误」，名字用 `danger`，内容是报错的第一句（去掉堆栈）；完整报错在 JSON 里。
- **太长**：整个详情块最高 `tool-detail-max-height`，超出时在块内滚动，不把对话撑长。

### JSON

- 显示完整的输入和输出，分「输入」「输出」两段，小标题同预览里的参数名。
- **格式化**：两个空格缩进，每个键一行；字符串里的 JSON 先解析再缩进显示，不露出 `\"` 这样的转义；MCP 的外层包装也展开成结构。
- **只用灰度区分**：键 `ink-secondary`，值 `ink`，括号、冒号、逗号 `ink-tertiary`；不用彩色语法高亮。等宽 `caption`，行高 1.6。
- **长字符串**：超过 200 字只显示前面一段，后面跟「展开 312 字」；长单词和 ID 可以在任意位置折行，不横向滚动。
- **复制**：复制的是工具收发的原始数据（没有解析、没有截断），点击后显示「已复制」1.5 秒。
- **记住选择**：用户切到 JSON 后，之后点开的其他步骤也直接显示 JSON；这个选择按用户保存。

## 思考

- 思考进行中，对话末尾的运行状态是 `thinking` 动效加「正在思考」和已用时间；思考完成后动效停下，折叠成一行「已思考 12 秒」，样式和摘要行相同（`thinking` 图标、`type-body`、`ink-secondary`、小箭头）。
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
.dn-activity > summary > .dn-icon:last-child { width: var(--icon-size-sm); height: var(--icon-size-sm); transition: transform var(--duration-base) var(--ease-standard); }
.dn-activity[open] > summary > .dn-icon:last-child { transform: rotate(90deg); }
.dn-activity > summary > .dn-icon:first-child:not(:last-child) { width: var(--icon-size-md); height: var(--icon-size-md); margin-right: var(--space-1); }
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
.dn-tool {
  min-width: 0;
  max-height: var(--tool-detail-max-height);
  margin: 2px 0 6px calc(6px + var(--icon-size-md) + var(--space-2));
  overflow: auto;
  padding: var(--space-1) var(--space-3) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--surface-sunken);
}
.dn-tool-head { display: flex; align-items: center; gap: var(--space-2); min-height: var(--button-height-md); }
.dn-tool-name { min-width: 0; margin-right: auto; overflow: hidden; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
.dn-tool-view { display: inline-flex; flex: none; gap: 2px; }
.dn-tool-view > button { height: calc(var(--button-height-md) - 8px); padding: 0 var(--space-2); border: 0; border-radius: var(--radius-xs); background: transparent; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); cursor: pointer; }
@media (hover: hover) { .dn-tool-view > button:hover { color: var(--ink); } }
.dn-tool-view > button[aria-pressed="true"] { background: var(--surface-raised); box-shadow: var(--shadow-control); color: var(--ink); }
.dn-tool-fields { display: grid; grid-template-columns: var(--tool-key-width) minmax(0, 1fr); gap: var(--space-1) var(--space-3); margin: 0; color: var(--ink); font: var(--type-callout); }
.dn-tool-fields + .dn-tool-fields { margin-top: var(--space-2); padding-top: var(--space-2); border-top: var(--stroke-line) solid var(--line); }
.dn-tool-fields > dt { overflow: hidden; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-callout-line) var(--font-sans); text-overflow: ellipsis; white-space: nowrap; }
.dn-tool-fields > dd { min-width: 0; margin: 0; overflow-wrap: anywhere; }
.dn-tool-fields > dd.is-code { color: var(--ink-secondary); font: var(--weight-regular) var(--type-caption-size)/var(--type-callout-line) var(--font-mono); white-space: pre-wrap; }
.dn-tool-fields > dd.is-muted { color: var(--ink-secondary); }
.dn-tool-fields > dt.is-error { color: var(--danger); }
.dn-tool-clamp { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.dn-tool-more { display: block; margin-top: 2px; padding: 0; border: 0; background: none; color: var(--ink-secondary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); cursor: pointer; }
@media (hover: hover) { .dn-tool-more:hover { color: var(--ink); } }
.dn-tool-label { display: block; margin: var(--space-2) 0 2px; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); }
.dn-tool-head + .dn-tool-label { margin-top: 0; }
.dn-json { margin: 0; color: var(--ink); font: var(--weight-regular) var(--type-caption-size)/1.6 var(--font-mono); white-space: pre-wrap; overflow-wrap: anywhere; tab-size: 2; }
.dn-json-key { color: var(--ink-secondary); }
.dn-json-punct { color: var(--ink-tertiary); }
.dn-json .dn-tool-more { display: inline; margin: 0 0 0 var(--space-1); }
.dn-tool-head .dn-icon-button { flex: none; width: calc(var(--button-height-md) - 8px); height: calc(var(--button-height-md) - 8px); color: var(--ink-tertiary); }
.dn-tool-head .dn-icon-button .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }

.dn-running { display: flex; align-items: center; gap: var(--space-2); min-height: var(--button-height-md); color: var(--ink-secondary); font: var(--type-body); }
.dn-running-time { color: var(--ink-tertiary); font-variant-numeric: tabular-nums; }
```

```html
<div class="dn-stack">
  <details class="dn-activity">
    <summary><svg class="dn-icon" aria-hidden="true"><use href="#dn-thinking"/></svg>已思考 12 秒<svg class="dn-icon" aria-hidden="true"><use href="#dn-chevron-right"/></svg></summary>
    <div class="dn-thinking"><p>用户要三条要点。先读周报草稿，确认有哪些进展，再对照上周的周报去掉重复的内容。</p><p>测试结果也要一起看，避免把还没通过的修复写成已完成。</p></div>
  </details>
  <details class="dn-activity" open>
    <summary><svg class="dn-icon" aria-hidden="true"><use href="#dn-tool"/></svg>已运行 2 个命令，已读取 1 个文件<svg class="dn-icon" aria-hidden="true"><use href="#dn-chevron-right"/></svg></summary>
    <div class="dn-steps">
      <div class="dn-step is-success"><svg class="dn-icon dn-step-glyph" aria-hidden="true"><use href="#dn-success"/></svg><span class="dn-step-name">读取</span><span class="dn-step-summary">周报草稿.md</span><span class="dn-step-meta">0.4 秒</span></div>
      <details open>
        <summary class="dn-step is-success"><svg class="dn-icon dn-step-glyph" aria-hidden="true"><use href="#dn-success"/></svg><span class="dn-step-name">运行</span><span class="dn-step-summary">npm test</span><span class="dn-step-meta">12.3 秒</span></summary>
        <div class="dn-step-detail"><span class="dn-step-detail-label">输入</span><div>npm test</div><span class="dn-step-detail-label">输出</span><div>tests 63 · pass 63 · fail 0</div></div>
      </details>
      <div class="dn-step is-failed"><svg class="dn-icon dn-step-glyph" aria-hidden="true"><use href="#dn-error"/></svg><span class="dn-step-name">运行</span><span class="dn-step-summary">npm run lint：找不到 eslint 配置</span><span class="dn-step-meta">已跳过</span></div>
    </div>
  </details>
  <div class="dn-steps">
    <div class="dn-step is-waiting"><svg class="dn-icon dn-step-glyph" aria-hidden="true"><use href="#dn-waiting"/></svg><span class="dn-step-name">写入</span><span class="dn-step-summary">docs/weekly.md</span><span class="dn-step-meta">等待你确认</span></div>
    <div class="dn-step is-skipped"><svg class="dn-icon dn-step-glyph" aria-hidden="true"><use href="#dn-skipped"/></svg><span class="dn-step-name">推送</span><span class="dn-step-summary">git push origin main</span><span class="dn-step-meta">已拒绝</span></div>
  </div>
  <div class="dn-running" role="status"><dn-loader name="working"></dn-loader>正在运行 命令<span class="dn-running-time">42 秒</span></div>
</div>
```

### 工具详情示例

预览视图：上面是一次委派（MCP 工具 `herd · delegate_task`），下面是一条失败的命令。

```html
<div class="dn-steps">
  <details open>
    <summary class="dn-step is-success"><svg class="dn-icon dn-step-glyph" aria-hidden="true"><use href="#dn-success"/></svg><span class="dn-step-name">委派</span><span class="dn-step-summary">DSH · 第 20 轮成语接龙，接「化」开头的成语</span><span class="dn-step-meta">6 秒</span></summary>
    <div class="dn-tool">
      <div class="dn-tool-head"><span class="dn-tool-name">herd · delegate_task</span><div class="dn-tool-view" role="group" aria-label="显示方式"><button type="button" aria-pressed="true">预览</button><button type="button" aria-pressed="false">JSON</button></div><button class="dn-icon-button" type="button" aria-label="复制原始数据"><svg class="dn-icon" aria-hidden="true"><use href="#dn-copy"/></svg></button></div>
      <dl class="dn-tool-fields">
        <dt>接收方</dt><dd>DSH <span class="dn-step-summary">afa13cc4…442a</span></dd>
        <dt>任务</dt><dd><div class="dn-tool-clamp">完成追加 10 轮成语接龙（第 11–20 轮）的最后一轮。每轮 Codex 和 DSH 各一个，严格尾字接首字，同字不谐音，全局不重复。已用成语依次为：一心一意、意气风发、发扬光大、大器晚成……</div><button class="dn-tool-more" type="button">展开全部 · 312 字</button></dd>
      </dl>
      <dl class="dn-tool-fields">
        <dt>回复</dt><dd>第 20 轮 DSH：化险为夷</dd>
        <dt>状态</dt><dd class="is-muted">已接受</dd>
      </dl>
    </div>
  </details>
  <details open>
    <summary class="dn-step is-failed"><svg class="dn-icon dn-step-glyph" aria-hidden="true"><use href="#dn-error"/></svg><span class="dn-step-name">运行</span><span class="dn-step-summary">npm run build</span><span class="dn-step-meta">3.1 秒</span></summary>
    <div class="dn-tool">
      <div class="dn-tool-head"><span class="dn-tool-name">bash</span><div class="dn-tool-view" role="group" aria-label="显示方式"><button type="button" aria-pressed="true">预览</button><button type="button" aria-pressed="false">JSON</button></div><button class="dn-icon-button" type="button" aria-label="复制原始数据"><svg class="dn-icon" aria-hidden="true"><use href="#dn-copy"/></svg></button></div>
      <dl class="dn-tool-fields">
        <dt>命令</dt><dd class="is-code">npm run build</dd>
      </dl>
      <dl class="dn-tool-fields">
        <dt class="is-error">错误</dt><dd>找不到模块 ./tokens.css（退出码 1）</dd>
        <dt>输出</dt><dd class="is-code">vite v6.0.7 building for production…
✗ Build failed in 412ms
error: Could not resolve "./tokens.css" from "src/main.ts"</dd>
      </dl>
    </div>
  </details>
</div>
```

切到 JSON 后：格式化、只用灰度、字符串里的 JSON 已经解析，长字符串截断。

```html
<div class="dn-steps">
  <details open>
    <summary class="dn-step is-success"><svg class="dn-icon dn-step-glyph" aria-hidden="true"><use href="#dn-success"/></svg><span class="dn-step-name">委派</span><span class="dn-step-summary">DSH · 第 20 轮成语接龙，接「化」开头的成语</span><span class="dn-step-meta">6 秒</span></summary>
    <div class="dn-tool">
      <div class="dn-tool-head"><span class="dn-tool-name">herd · delegate_task</span><div class="dn-tool-view" role="group" aria-label="显示方式"><button type="button" aria-pressed="false">预览</button><button type="button" aria-pressed="true">JSON</button></div><button class="dn-icon-button" type="button" aria-label="复制原始数据"><svg class="dn-icon" aria-hidden="true"><use href="#dn-copy"/></svg></button></div>
      <span class="dn-tool-label">输入</span>
<pre class="dn-json"><span class="dn-json-punct">{</span>
  <span class="dn-json-key">"agentId"</span><span class="dn-json-punct">:</span> "afa13cc4-e519-4cec-9ef3-72c0081a442a"<span class="dn-json-punct">,</span>
  <span class="dn-json-key">"task"</span><span class="dn-json-punct">:</span> "现在完成用户要求的追加10轮成语接龙（第11–20轮）的最后一轮。每轮 Codex 和 DSH 各一个…"<button class="dn-tool-more" type="button">展开 312 字</button>
<span class="dn-json-punct">}</span></pre>
      <span class="dn-tool-label">输出</span>
<pre class="dn-json"><span class="dn-json-punct">{</span>
  <span class="dn-json-key">"accepted"</span><span class="dn-json-punct">:</span> true<span class="dn-json-punct">,</span>
  <span class="dn-json-key">"itemId"</span><span class="dn-json-punct">:</span> "b0e7b33a-a193-4d41-a0ac-5c2e8f1d9b07"<span class="dn-json-punct">,</span>
  <span class="dn-json-key">"reply"</span><span class="dn-json-punct">:</span> "第20轮 DSH：化险为夷"
<span class="dn-json-punct">}</span></pre>
    </div>
  </details>
</div>
```

真实页面里，「预览 / JSON」由脚本切换 `aria-pressed` 和内容，并把选择存到用户设置里。

## SwiftUI

工具详情的预览用 `Grid`（两列，参数名列宽 `toolKeyWidth`），长文本 `.lineLimit(2)` 加「展开全部」；JSON 视图用 `ScrollView` 里的等宽 `Text`，最高 `toolDetailMaxHeight`；「预览 / JSON」用小号 `Picker(.segmented)`，选择存进 `@AppStorage`。

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
- 步骤行显示工具全名和参数 JSON（`mcp.herd.delegate_task · {"server":…`）；详情默认就是原始 JSON。
- 把转义过的字符串（`\"accepted\":true`）原样给人看；给 JSON 用彩色语法高亮。
- 预览里截断了，复制出来的也是截断的。
- 把思考过程默认展开，或者用和正文一样的黑色排版；把被拒绝、被停止的步骤从记录里删掉。
