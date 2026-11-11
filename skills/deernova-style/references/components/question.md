# AI 提问

AI 做到一半，遇到只有用户能定的事（选哪种方案、范围多大、用哪个账号），停下来问一句，给出几个选项让用户点。和[确认与审批](approval.md)用同一种卡片：确认卡只问「做不做」，提问卡问「怎么做」。用户回答后，卡片收起成一行，留在对话里。

**需要提供**：问题（一句话，问号结尾）；2–4 个选项，每个一个短标签，可选一行说明；推荐的选项；单选还是多选；同一张卡最多 4 个问题。

## 尺寸

<!-- tokens:question -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `question-option-height` | 36 | 48 | 40 | 提问卡里每个选项的最小高度（只有一行字时的高度）。 |
<!-- /tokens -->

- **卡片**：和确认卡完全一样：`surface-raised` 底、1px `line` 描边、`card-radius`，内边距 `card-padding-y` / `card-padding-x`，不加阴影，宽度和回答正文一致。
- **标题行**：`icon-size-md` 的问号图标、问题本身（`headline`，可以换行，不截断）、右侧 `caption` 的状态（`ink-tertiary`）：只有一个问题时写「等待你回答」，多个问题时写「1 / 3」。
- **说明**：需要时在问题下面补一句为什么要问，`callout`、`ink-secondary`。
- **选项**：竖排，和标题之间 `space-2`，选项之间 2px。每个选项最低 `question-option-height`，左右 `space-2` 内边距，`radius-sm`；整行可点，悬停 `fill-hover`，选中 `fill-selected`。
  - 左边是单选圆或复选框，样式同[选择控件](choice.md)，和标签的第一行对齐。
  - 标签 `body`、`ink`；说明 `caption`、`ink-tertiary`，在标签下面一行。
  - 推荐的选项排第一，标签后面跟一个「推荐」[标签](tag.md)（默认灰色样式）。
  - 右边是数字快捷键提示（1、2、3…），`caption`、`ink-tertiary`，和第一行对齐；触控设备上不显示。
  - 最后一项固定是「其他」：选中后在它下面出现一个[输入框](text-field.md)，光标自动进去，用户写自己的答案。这个输入框放在选中行的灰底上，所以平时就用聚焦后的样子（`surface-raised` 底加 `shadow-control`），不然看不出边界。
- **按钮行**：和选项之间 `space-3`。左边是「跳过」（文字按钮）；右边是「上一题」（次按钮，第一题没有）和主按钮：还有下一题时写「下一题」，最后一题写「提交」。

## 交互

- **单选**：点一个选项就选中并进入下一题，最后一题点了直接提交；不需要再按按钮。选了「其他」要等用户输入，按回车或主按钮提交。
- **多选**：可以选多个，用主按钮进入下一题或提交；一个都没选时主按钮禁用。
- **多个问题**：一次只显示一个，答完切到下一个，内容在卡片里原地替换（`duration-base` 淡入），卡片高度跟着变化，不跳动；可以「上一题」回去改。最后一题提交时一起发出。
- **键盘**：卡片出现时焦点不移过去，用户按 Tab 或点击进入。焦点在卡片里时，数字键选对应的选项，方向键上下移动，回车确认，Esc 等于「跳过」。输入框里有文字时数字键不生效。
- **直接打字**：卡片等待时，用户也可以不点选项，直接在 [Composer](composer.md) 里写回答发出去，等于「其他」。Composer 的占位文字改成「也可以直接输入你的回答」。
- **跳过**：AI 按自己判断的默认做法继续，并在回答里写一句「你跳过了 X，我按 Y 处理」。
- **等待时**：对话末尾的运行状态写「等待你回答」，加载动效换成 `waiting` 图标，同[确认与审批](approval.md)。

## 回答之后

- 卡片收起成一行灰字：一个问题时写「已回答：快速修复」；多个问题时写「已回答 3 个问题」，可以点开看每个问题和答案。跳过的写「已跳过」。
- 收起后的样子和确认卡收起后一样（`body`、`ink-secondary`，前面一个小对勾）；展开的问答列表里问题 `callout`、`ink-tertiary`，答案 `body`、`ink`。
- 不能在收起后再改答案；想改就在 Composer 里说。

## 怎么写问题

- **只问 AI 自己定不了的事**：能从上下文、文件、设置里查到的不要问；有公认做法的直接做，在回答里说明。
- **一次问清楚**：一张卡最多 4 个问题，同一件事不要分两张卡问。
- **问题一句话**，写清在问什么：「这个 bug 先快速修，还是重构整个模块？」不要「你想怎么做？」。
- **选项 2–4 个**，互相不重叠；标签 2–12 个字，名词或动词短语；说明写后果（「改动 3 个文件，今天能发」），不重复标签。「其他」自动出现，不写进选项里。
- **推荐只给一个**，有理由时才给；推荐的排第一。

## Web

卡片用 `role="group"` 加 `aria-labelledby` 指向问题；选项用原生的 `<input type="radio">` 或 `checkbox`，外面的容器 `role="radiogroup"`（多选用 `role="group"`）并用 `aria-labelledby` 指向同一个问题。卡片出现时用 `aria-live="polite"` 读出问题，不抢焦点。数字快捷键用 `aria-keyshortcuts` 标在每个选项的输入上。

需要和[确认与审批](approval.md)、[选择控件](choice.md)、[标签](tag.md)的 CSS 一起使用：

```css
.dn-question .dn-approval-title { overflow: visible; white-space: normal; }
.dn-question .dn-approval-head { align-items: flex-start; }
.dn-question .dn-approval-head > .dn-icon { margin-top: calc((var(--type-headline-line) - var(--icon-size-md)) / 2); }
.dn-question .dn-approval-status { margin-top: calc((var(--type-headline-line) - var(--type-caption-size)) / 2); font-variant-numeric: tabular-nums; }
.dn-question-options { display: grid; gap: 2px; min-width: 0; margin: var(--space-2) calc(var(--space-2) * -1) 0; }
.dn-question-option {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  min-height: var(--question-option-height);
  padding: calc((var(--question-option-height) - var(--type-body-line)) / 2) var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--ink);
  font: var(--type-body);
  cursor: pointer;
  transition: background-color var(--duration-instant) var(--ease-standard);
}
@media (hover: hover) { .dn-question-option:hover { background: var(--fill-hover); } }
.dn-question-option:has(> .dn-choice-box > input:checked) { background: var(--fill-selected); }
.dn-question-option:has(> .dn-choice-box > input:focus-visible) { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: calc(-1 * var(--stroke-focus)); }
.dn-question-option .dn-choice-box > input:focus-visible { outline: none; } /* 环画在整行上，方框不再重复 */
.dn-question-text { display: grid; flex: 1; gap: 2px; min-width: 0; }
.dn-question-label { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
.dn-question-label > .dn-tag { font-weight: var(--weight-regular); }
.dn-question-help { color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); }
.dn-question-key { flex: none; min-width: 1.5ch; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-body-line) var(--font-sans); font-variant-numeric: tabular-nums; text-align: center; }
@media (pointer: coarse) { .dn-question-key { display: none; } }
.dn-question-other { margin-top: var(--space-1); background: var(--surface-raised); box-shadow: var(--shadow-control); }
.dn-question-option:not(:has(> .dn-choice-box > input:checked)) .dn-question-other { display: none; }
.dn-activity > summary .dn-approval-done > .dn-icon { transform: none; }
.dn-question-answers { display: grid; gap: var(--space-2); margin: var(--space-1) 0 0 6px; padding-left: var(--space-3); border-left: var(--stroke-line) solid var(--line); }
.dn-question-answers dt { color: var(--ink-tertiary); font: var(--type-callout); }
.dn-question-answers dd { margin: 0; color: var(--ink); font: var(--type-body); }
```

单选的问题（第一题，三个问题中的一个），选了「其他」：

```html
<div class="dn-stack">
  <div class="dn-approval dn-question" role="group" aria-labelledby="q1">
    <div class="dn-approval-head"><svg class="dn-icon" aria-hidden="true"><use href="#dn-question"/></svg><h3 class="dn-approval-title" id="q1">这个 bug 先快速修，还是重构整个同步模块？</h3><span class="dn-approval-status">1 / 3</span></div>
    <div class="dn-question-options" role="radiogroup" aria-labelledby="q1">
      <label class="dn-question-option"><span class="dn-choice-box"><input type="radio" name="q1" aria-keyshortcuts="1"></span><span class="dn-question-text"><span class="dn-question-label">快速修复<span class="dn-tag">推荐</span></span><span class="dn-question-help">改动 3 个文件，今天能发版。</span></span><span class="dn-question-key" aria-hidden="true">1</span></label>
      <label class="dn-question-option"><span class="dn-choice-box"><input type="radio" name="q1" aria-keyshortcuts="2"></span><span class="dn-question-text"><span class="dn-question-label">重构同步模块</span><span class="dn-question-help">彻底解决重复保存，大约需要两天。</span></span><span class="dn-question-key" aria-hidden="true">2</span></label>
      <label class="dn-question-option"><span class="dn-choice-box"><input type="radio" name="q1" aria-keyshortcuts="3" checked></span><span class="dn-question-text"><span class="dn-question-label">其他</span><input class="dn-input dn-question-other" type="text" aria-label="其他回答" placeholder="写下你的想法" value="先快速修，下周再重构"></span><span class="dn-question-key" aria-hidden="true">3</span></label>
    </div>
    <div class="dn-approval-actions">
      <button class="dn-button is-plain" type="button">跳过</button>
      <button class="dn-button is-primary" type="button">下一题</button>
    </div>
  </div>
</div>
```

多选的问题（最后一题），以及回答之后收起的样子：

```html
<div class="dn-stack">
  <div class="dn-approval dn-question" role="group" aria-labelledby="q3">
    <div class="dn-approval-head"><svg class="dn-icon" aria-hidden="true"><use href="#dn-question"/></svg><h3 class="dn-approval-title" id="q3">修完以后要同步给哪些地方？</h3><span class="dn-approval-status">3 / 3</span></div>
    <p class="dn-approval-body">可以多选。</p>
    <div class="dn-question-options" role="group" aria-labelledby="q3">
      <label class="dn-question-option"><span class="dn-choice-box"><input type="checkbox" aria-keyshortcuts="1" checked><svg class="dn-icon is-check" aria-hidden="true"><use href="#dn-check"/></svg></span><span class="dn-question-text"><span class="dn-question-label">更新日志</span></span><span class="dn-question-key" aria-hidden="true">1</span></label>
      <label class="dn-question-option"><span class="dn-choice-box"><input type="checkbox" aria-keyshortcuts="2" checked><svg class="dn-icon is-check" aria-hidden="true"><use href="#dn-check"/></svg></span><span class="dn-question-text"><span class="dn-question-label">本周周报</span></span><span class="dn-question-key" aria-hidden="true">2</span></label>
      <label class="dn-question-option"><span class="dn-choice-box"><input type="checkbox" aria-keyshortcuts="3"><svg class="dn-icon is-check" aria-hidden="true"><use href="#dn-check"/></svg></span><span class="dn-question-text"><span class="dn-question-label">团队群通知</span><span class="dn-question-help">发到「客户端」群，会 @ 值班的人。</span></span><span class="dn-question-key" aria-hidden="true">3</span></label>
      <label class="dn-question-option"><span class="dn-choice-box"><input type="checkbox" aria-keyshortcuts="4"><svg class="dn-icon is-check" aria-hidden="true"><use href="#dn-check"/></svg></span><span class="dn-question-text"><span class="dn-question-label">其他</span><input class="dn-input dn-question-other" type="text" aria-label="其他回答" placeholder="写下你的想法"></span><span class="dn-question-key" aria-hidden="true">4</span></label>
    </div>
    <div class="dn-approval-actions">
      <button class="dn-button is-plain" type="button">跳过</button>
      <button class="dn-button" type="button">上一题</button>
      <button class="dn-button is-primary" type="button">提交</button>
    </div>
  </div>
  <details class="dn-activity">
    <summary><span class="dn-approval-done"><svg class="dn-icon" aria-hidden="true"><use href="#dn-check"/></svg>已回答 3 个问题</span><svg class="dn-icon" aria-hidden="true"><use href="#dn-chevron-right"/></svg></summary>
    <dl class="dn-question-answers">
      <div><dt>这个 bug 先快速修，还是重构整个同步模块？</dt><dd>先快速修，下周再重构</dd></div>
      <div><dt>修复要不要带上离线提示？</dt><dd>要</dd></div>
      <div><dt>修完以后要同步给哪些地方？</dt><dd>更新日志、本周周报</dd></div>
    </dl>
  </details>
</div>
```

真实页面里，切换问题、数字快捷键和「其他」获得焦点由脚本处理；收起的那一行用[思考、工具调用与执行步骤](step-row.md)的 `.dn-activity`。

## SwiftUI

卡片和确认卡一样，是一个带描边的 `VStack`。选项用 `ForEach` 出一组 `Button`，每个 `Button` 里是 `HStack`：`Image(systemName: selected ? "largecircle.fill.circle" : "circle")`（多选用 `checkmark.square.fill` / `square`）、标签和说明的 `VStack(alignment: .leading)`；`.frame(minHeight: Deernova.questionOptionHeight)`，选中时 `.background(.fillSelected, in: .rect(cornerRadius: Deernova.radiusSm))`。数字快捷键用 `.keyboardShortcut(KeyEquivalent(Character("\(index + 1)")), modifiers: [])`。「其他」选中后在下面显示 `TextField` 并用 `@FocusState` 聚焦。多个问题用一个「当前第几题」的状态切换内容，加 `.transition(.opacity)`。

## 不要

- 能自己查到的事也问用户；同一件事分几张卡问；一张卡塞超过 4 个问题。
- 问题写成「你想怎么做？」；选项互相重叠，或者把「其他」写进选项里。
- 每个选项都标推荐，或者把推荐的放在中间。
- 把几个问题一次全部铺开；单选也要求再点一次「确定」。
- 卡片一出现就抢走焦点，打断用户正在 Composer 里输入的内容。
- 回答后卡片一直展开留在对话里，或者整张删掉。
- 给选项用彩色底、给推荐用彩色标签。
