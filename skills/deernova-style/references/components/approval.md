# 确认与审批

AI 在替用户做事时，遇到需要用户拍板的地方就停下来，在对话里出一张确认卡。三种用途共用同一种卡片：**权限请求**（要运行命令、写文件、访问网络）、**计划审批**（先给出计划，批准后再执行）、**变更确认**（改了哪些文件，逐个查看后保留或撤销）。用户做完决定后，卡片收起成一行，留在对话里。

**需要提供**：AI 想做的动作（动词加对象）、具体内容（命令、文件、网址、计划步骤或改动）、影响范围、可选的「总是允许」的范围，以及决定之后的结果文字。

## 尺寸

<!-- tokens:approval -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `diff-line-height` | 20 | 22 | 22 | 变更对比里每一行的高度。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `diff-gutter-width` | `40px` | 变更对比左侧行号栏的宽度。 |
| `approval-code-max-height` | `160px` | 确认卡里命令、参数块的最大高度，超出时内部滚动。 |
<!-- /tokens -->

- 卡片：`surface-raised` 底、`stroke-line` 宽的 `line` 描边、`card-radius`，内边距上下 `card-padding-y`、左右 `card-padding-x`，不加阴影；宽度和回答正文一致，不超过 `content-max`。
- 标题行：`icon-size-md` 的图标（`ink`）、标题（`headline`，写动作本身，例如「运行命令」「写入 3 个文件」）、右侧 `caption` 的「等待你确认」（`ink-tertiary`）。
- 说明：一句话写影响，`callout`、`ink-secondary`，和标题之间 `space-1`。
- 内容：命令、网址、参数放在 `surface-sunken` 底、`radius-sm` 的等宽块里，最高 `approval-code-max-height`，超出时内部滚动；计划是编号列表；变更是文件列表。
- 按钮行：和内容之间 `space-3`。左边是「拒绝」（文字按钮），右边是「总是允许」（次按钮，后面用 `ink-secondary` 写清范围，例如「本项目」）和「允许一次」（主按钮，最右边）。按钮是默认尺寸，见[按钮](button.md)。

## 权限请求

- 写清 AI 要做什么、对什么做、在哪里做：「运行命令 · 在 deernova-style 目录」「访问 github.com」「写入 3 个文件」。命令原样显示，不改写成自然语言。
- 「总是允许」只给可以放心重复的操作，并写清范围（本会话、本项目、这个命令）；用户之后可以在设置里收回。
- **危险操作**（删除、强制推送、付款、对外发送、离开工作目录）：图标和一行「这个操作不能撤销」用 `danger`；主按钮用实色危险样式（`is-primary is-danger`），文字写动作「删除 12 个文件」；不提供「总是允许」。
- 拒绝时 AI 换一种做法或者停下来说明；用户也可以不点按钮，直接在 Composer 里输入新的指示，等于拒绝并告诉它怎么做。

## 计划审批

- 标题「计划」，下面是编号的步骤列表，每步一句话、动词开头，和[任务清单](task-list.md)的写法一致；批准后这张卡就变成任务清单，原地显示进度。
- 按钮：左边「修改」（把计划放进 Composer，让用户改了再发），右边「开始执行」（主按钮）。
- 计划很长时，默认显示前 5 步，其余折叠成「还有 4 步」。

## 变更确认

- 标题写改了什么：「修改了 3 个文件」，右侧是总的增删行数：`+42`（`success`）`−8`（`danger`），等宽数字。
- 文件列表：每个文件一行，高 `button-height-md`，依次是文件图标、路径（等宽，过长时省略中间目录）、增删行数、展开箭头；新建和删除的文件在路径后写「新建」「删除」。
- 展开一个文件是逐行的对比：行号栏宽 `diff-gutter-width`，每行高 `diff-line-height`，等宽字。新增的行 `success-soft` 底、行首「+」，删除的行 `danger-soft` 底、行首「−」，不变的行照常显示；长段没有改动的行折叠成「展开 24 行未修改」。颜色只用来区分增删，同时有「+」「−」符号。
- 按钮分两种情况，按真实状态写：改动还没应用时是「拒绝」和「应用」；已经写进文件时是「撤销」和「保留」。每个文件行末尾也可以单独保留或撤销。

## 决定之后

- 卡片收起成一行，样式和[执行步骤](step-row.md)的摘要行一样：`ink-secondary` 的「已允许 · 运行 npm install」「已拒绝 · 写入 3 个文件」「已保留 3 个文件的修改」，可以点开看原来的内容。
- 收起和展开用 `duration-base` 的高度过渡；不要让卡片直接消失，用户要能回看自己批准过什么。
- 超时或者会话被停止：收起成「未处理 · 运行已停止」，`ink-tertiary`。

## 等待中的行为

- 同一时间只显示一张待确认的卡，排在对话最后；还有更多时，标题行右侧写「还有 2 项」。
- 卡片出现时，如果用户停在对话底部，就滚到能看见整张卡；如果用户在往上翻，不要强行滚动，「回到底部」按钮上显示「1 项等待确认」。
- 运行状态行变成「等待你确认」，加载动效换成 `waiting` 图标；Composer 的停止按钮仍然可用，点了等于全部拒绝并停止。
- 用户离开这个会话时，侧边栏的会话前出现 `ink` 色实心圆点；系统允许时发通知「需要你确认：运行命令」。
- 键盘：卡片里的按钮按 Tab 可以到达，主按钮在 Tab 顺序的最后；Composer 为空时，⌘-Return 等于主按钮，Esc 等于拒绝；浮层打开时 Esc 先关浮层，见 [Composer 的 Esc 顺序](composer.md#键盘和输入法)。不要用倒计时逼用户做决定。

## Web

卡片用 `role="group"` 加 `aria-labelledby` 指向标题；出现时用一个 `aria-live="assertive"` 的区域读出标题，不抢焦点。

```css
.dn-approval {
  box-sizing: border-box;
  display: grid;
  gap: var(--space-1);
  width: 100%;
  min-width: 0;
  max-width: var(--content-max);
  padding: var(--card-padding-y) var(--card-padding-x);
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--card-radius);
  background: var(--surface-raised);
  color: var(--ink);
}
.dn-approval-head { display: flex; align-items: center; gap: var(--space-2); min-width: 0; }
.dn-approval-head > .dn-icon { flex: none; width: var(--icon-size-md); height: var(--icon-size-md); }
.dn-approval-title { margin: 0; overflow: hidden; font: var(--type-headline); text-overflow: ellipsis; white-space: nowrap; }
.dn-approval-status { flex: none; margin-left: auto; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); }
.dn-approval-body { margin: 0; color: var(--ink-secondary); font: var(--type-callout); }
.dn-approval-code { margin: var(--space-2) 0 0; max-height: var(--approval-code-max-height); overflow: auto; padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); background: var(--surface-sunken); color: var(--ink); font: var(--type-code); white-space: pre-wrap; overflow-wrap: anywhere; }
.dn-approval-actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--gap-stack); margin-top: var(--space-3); }
.dn-approval-actions > :first-child { margin-right: auto; }
.dn-approval-scope { color: var(--ink-secondary); }
.dn-approval.is-danger .dn-approval-head > .dn-icon, .dn-approval-warning { color: var(--danger); }
.dn-approval-warning { margin: 0; font: var(--type-callout); }
.dn-approval-plan { margin: var(--space-2) 0 0; padding-left: 1.4em; color: var(--ink); font: var(--type-body); }
.dn-approval-plan li + li { margin-top: var(--space-1); }
.dn-approval-total { display: inline-flex; gap: var(--space-2); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-mono); font-variant-numeric: tabular-nums; }
.dn-diff-add { color: var(--success); }
.dn-diff-del { color: var(--danger); }
.dn-changes { margin: var(--space-2) 0 0; padding: 0; list-style: none; }
.dn-change { display: flex; align-items: center; gap: var(--space-2); height: var(--button-height-md); padding: 0 var(--space-2); border-radius: var(--radius-sm); font: var(--weight-regular) var(--type-callout-size)/1 var(--font-sans); }
@media (hover: hover) { .dn-change:hover { background: var(--fill-hover); } }
.dn-change > .dn-icon { flex: none; width: var(--icon-size-md); height: var(--icon-size-md); color: var(--ink-secondary); }
.dn-change-path { min-width: 0; overflow: hidden; font: var(--weight-regular) var(--type-caption-size)/1 var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
.dn-change-tag { flex: none; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); }
.dn-change .dn-approval-total { margin-left: auto; }
.dn-diff { margin: var(--space-1) 0 var(--space-2); overflow-x: auto; border-radius: var(--radius-sm); background: var(--surface-sunken); font: var(--weight-regular) var(--type-code-size)/var(--diff-line-height) var(--font-mono); }
.dn-diff-line { display: grid; grid-template-columns: var(--diff-gutter-width) 1.2em max-content; min-height: var(--diff-line-height); color: var(--ink); white-space: pre; }
.dn-diff-line > span:first-child { padding-right: var(--space-2); color: var(--ink-tertiary); text-align: right; font-variant-numeric: tabular-nums; }
.dn-diff-line.is-add { background: var(--success-soft); }
.dn-diff-line.is-del { background: var(--danger-soft); }
.dn-diff-line.is-add > span:nth-child(2) { color: var(--success); }
.dn-diff-line.is-del > span:nth-child(2) { color: var(--danger); }
.dn-diff-fold { padding: 0 var(--space-2) 0 calc(var(--diff-gutter-width) + 1.2em); color: var(--ink-tertiary); font-family: var(--font-sans); font-size: var(--type-caption-size); }
.dn-approval-done { display: flex; align-items: center; gap: var(--space-1); min-height: var(--button-height-md); color: var(--ink-secondary); font: var(--type-body); }
.dn-approval-done > .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
```

权限请求，以及危险操作：

```html
<div class="dn-stack">
  <div class="dn-approval" role="group" aria-labelledby="ap1">
    <div class="dn-approval-head"><svg class="dn-icon" aria-hidden="true"><use href="#dn-terminal"/></svg><h3 class="dn-approval-title" id="ap1">运行命令</h3><span class="dn-approval-status">等待你确认</span></div>
    <p class="dn-approval-body">在 deernova-style 目录里执行，会更新 node_modules。</p>
    <pre class="dn-approval-code">npm install @deernova/style@latest</pre>
    <div class="dn-approval-actions">
      <button class="dn-button is-plain" type="button">拒绝</button>
      <button class="dn-button" type="button">总是允许 <span class="dn-approval-scope">本项目</span></button>
      <button class="dn-button is-primary" type="button">允许一次</button>
    </div>
  </div>
  <div class="dn-approval is-danger" role="group" aria-labelledby="ap2">
    <div class="dn-approval-head"><svg class="dn-icon" aria-hidden="true"><use href="#dn-warning"/></svg><h3 class="dn-approval-title" id="ap2">删除 12 个文件</h3><span class="dn-approval-status">等待你确认</span></div>
    <p class="dn-approval-warning">这个操作不能撤销。</p>
    <pre class="dn-approval-code">rm -rf dist/ releases/old/</pre>
    <div class="dn-approval-actions">
      <button class="dn-button is-plain" type="button">拒绝</button>
      <button class="dn-button is-primary is-danger" type="button">删除 12 个文件</button>
    </div>
  </div>
</div>
```

计划审批，以及决定之后收起的样子：

```html
<div class="dn-stack">
  <div class="dn-approval" role="group" aria-labelledby="ap3">
    <div class="dn-approval-head"><svg class="dn-icon" aria-hidden="true"><use href="#dn-list"/></svg><h3 class="dn-approval-title" id="ap3">计划</h3><span class="dn-approval-status">等待你确认</span></div>
    <ol class="dn-approval-plan">
      <li>读取周报草稿和上周的周报</li>
      <li>按「进展、风险、下周计划」重新分段</li>
      <li>把结果写入 weekly.md</li>
    </ol>
    <div class="dn-approval-actions">
      <button class="dn-button is-plain" type="button">修改</button>
      <button class="dn-button is-primary" type="button">开始执行</button>
    </div>
  </div>
  <div class="dn-approval-done"><svg class="dn-icon" aria-hidden="true"><use href="#dn-check"/></svg>已允许 · 运行 npm test</div>
  <div class="dn-approval-done"><svg class="dn-icon" aria-hidden="true"><use href="#dn-skipped"/></svg>已拒绝 · 写入 3 个文件</div>
</div>
```

变更确认，展开其中一个文件：

```html
<div class="dn-approval" role="group" aria-labelledby="ap4">
  <div class="dn-approval-head"><svg class="dn-icon" aria-hidden="true"><use href="#dn-changes"/></svg><h3 class="dn-approval-title" id="ap4">修改了 3 个文件</h3><span class="dn-approval-total"><span class="dn-diff-add">+42</span><span class="dn-diff-del">−8</span></span></div>
  <ul class="dn-changes">
    <li class="dn-change"><svg class="dn-icon" aria-hidden="true"><use href="#dn-file"/></svg><span class="dn-change-path">docs/weekly.md</span><span class="dn-approval-total"><span class="dn-diff-add">+3</span><span class="dn-diff-del">−2</span></span></li>
  </ul>
  <div class="dn-diff" role="table" aria-label="docs/weekly.md 的改动">
    <div class="dn-diff-line"><span>12</span><span> </span><span>## 本周进展</span></div>
    <div class="dn-diff-line is-del"><span>13</span><span>−</span><span>- 首页改版进行中</span></div>
    <div class="dn-diff-line is-add"><span>13</span><span>+</span><span>- 首页改版定稿，下周三交给开发</span></div>
    <div class="dn-diff-line is-add"><span>14</span><span>+</span><span>- 离线重复保存的问题已修复</span></div>
    <div class="dn-diff-fold">展开 24 行未修改</div>
  </div>
  <ul class="dn-changes">
    <li class="dn-change"><svg class="dn-icon" aria-hidden="true"><use href="#dn-file"/></svg><span class="dn-change-path">src/report/format.ts</span><span class="dn-approval-total"><span class="dn-diff-add">+31</span><span class="dn-diff-del">−6</span></span></li>
    <li class="dn-change"><svg class="dn-icon" aria-hidden="true"><use href="#dn-file"/></svg><span class="dn-change-path">src/report/template.md</span><span class="dn-change-tag">新建</span><span class="dn-approval-total"><span class="dn-diff-add">+8</span></span></li>
  </ul>
  <div class="dn-approval-actions">
    <button class="dn-button is-plain" type="button">撤销全部</button>
    <button class="dn-button is-primary" type="button">保留全部</button>
  </div>
</div>
```

## SwiftUI

在对话流里画成卡片：`VStack` 放标题行、说明、等宽内容（`Text(command).font(.deernovaCode).textSelection(.enabled)`，`surfaceSunken` 底），按钮行用 `HStack { Button("拒绝") {}.buttonStyle(.plain); Spacer(); Button("总是允许") {}; Button("允许一次") {}.buttonStyle(.borderedProminent) }`。危险操作给主按钮加 `role: .destructive`。不要用系统 Alert 弹出确认：它会挡住对话，用户看不到上下文。

## 不要

- 用弹窗打断对话来要权限；把「是否继续？」当标题，不说要做什么。
- 把命令改写成自然语言，让用户看不到真正要执行的东西。
- 给危险操作提供「总是允许」；用倒计时逼用户确认。
- 决定之后让卡片消失，用户回看时找不到自己批准过什么。
- 同时摆出好几张待确认的卡；用黄色、彩色边框表示「等待中」。
