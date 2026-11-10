# 建议与新对话

AI 主动给出的下一步：新对话首页的**起始建议**，以及回答之后的**追问建议**。还有新对话首页本身怎么排。

**需要提供**：首页的问候语、3–4 条起始建议（每条一个图标和一句话）；每条回答之后最多 3 条追问建议；点击建议后是填进输入框还是直接发送。

## 尺寸

<!-- tokens:suggestion -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |

| Token | 值 | 用途 |
| --- | --- | --- |
| `suggestion-max-width` | `260px` | 起始建议按钮的最大宽度。 |
<!-- /tokens -->

## 新对话首页

- 在可用区域里视觉居中（上下留白约 2 : 3，见[布局与对齐](../foundations/layout.md)），宽度不超过 `content-max`。
- 从上到下：问候语、[Composer](composer.md)（双行布局，最少 2 行高）、起始建议。问候语用 `type-display`（衬线），一句话，例如「下午好，林一」或「今天想做什么？」；不放产品宣传语和大插画。
- 问候语和 Composer 之间 `space-6`，Composer 和建议之间 `space-4`。
- 最近的会话不放在首页正中，放在侧边栏；首页只保留「开始」这一件事。
- 用户开始输入后，起始建议淡出；清空输入后再出现。

## 起始建议

- 排成一行，放不下就换行，居中对齐；最多 4 条，可以有一个「换一批」文字按钮。
- 每条是一个建议按钮：高 `button-height-md`，`stroke-line` 宽的 `line` 描边、`button-radius`，透明底；`icon-size-sm` 的图标加一句话，`callout`、`ink-secondary`，最宽 `suggestion-max-width`，放不下时截断。悬停 `fill-hover`、文字变 `ink`。
- 文案动词开头、不超过 16 个字：「总结一份文件」「起草一封邮件」「解释这段代码」。根据用户最近在做的事调整，不要每次都一样。
- **点击后**：把完整的提示词填进输入框，光标停在末尾，让用户补充或修改；只有完全确定、不需要补充的动作（「总结当前页面」）才直接发送。

## 追问建议

- 放在回答的操作行下方，竖排，最多 3 条；每条一行：`icon-size-sm` 的右箭头加一句话，`callout`、`ink-secondary`，悬停 `fill-hover`、文字变 `ink`，行高 `button-height-md`。
- 只跟在最后一条回答后面；用户开始输入或发出新消息后消失。
- 内容具体、基于这次回答：「再精简到 100 字」「把第二点展开」「做成表格」，不要「告诉我更多」这类空话。
- 点击直接发送（它本身就是一条完整的追问）。

## Web

起始建议是一组 `<button>`，放在带 `aria-label="建议"` 的容器里；追问建议用列表。

```css
.dn-home { display: grid; grid-template-rows: 2fr auto 3fr; min-height: 100%; }
.dn-home-main { display: grid; grid-row: 2; justify-items: center; gap: var(--space-4); width: min(100%, var(--content-max)); margin-inline: auto; }
.dn-home-title { margin: 0 0 calc(var(--space-6) - var(--space-4)); color: var(--ink); font: var(--type-display); text-align: center; }
.dn-home-main > .dn-composer { width: 100%; }
.dn-suggestions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-2); }
.dn-suggestion {
  display: inline-flex;
  align-items: center;
  gap: var(--gap-inline);
  max-width: var(--suggestion-max-width);
  height: var(--button-height-md);
  padding: 0 var(--space-3);
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--button-radius);
  background: transparent;
  color: var(--ink-secondary);
  font: var(--weight-regular) var(--type-callout-size)/1 var(--font-sans);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--duration-instant) var(--ease-standard), color var(--duration-instant) var(--ease-standard);
}
.dn-suggestion > span { overflow: hidden; text-overflow: ellipsis; }
.dn-suggestion .dn-icon { flex: none; width: var(--icon-size-sm); height: var(--icon-size-sm); }
@media (hover: hover) { .dn-suggestion:hover { background: var(--fill-hover); color: var(--ink); } }
.dn-suggestion:active { background: var(--fill-selected); color: var(--ink); }
.dn-suggestion:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset); }
.dn-followups { display: grid; justify-items: start; gap: 2px; margin: var(--space-3) 0 0 calc(var(--space-2) * -1); padding: 0; list-style: none; }
.dn-followup { display: inline-flex; align-items: center; gap: var(--space-2); height: var(--button-height-md); padding: 0 var(--space-2); border: 0; border-radius: var(--button-radius); background: transparent; color: var(--ink-secondary); font: var(--type-callout); cursor: pointer; }
.dn-followup .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); color: var(--ink-tertiary); }
@media (hover: hover) { .dn-followup:hover { background: var(--fill-hover); color: var(--ink); } }
.dn-followup:active { background: var(--fill-selected); color: var(--ink); }
.dn-followup:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset); }
```

```html
<div class="dn-home-main">
  <h2 class="dn-home-title">下午好，林一</h2>
  <div class="dn-composer is-stacked">
    <textarea rows="2" aria-label="消息" placeholder="描述你要做的事，可以拖入文件"></textarea>
    <div class="dn-composer-toolbar">
      <button class="dn-icon-button" type="button" aria-label="添加" aria-haspopup="menu"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
      <div class="dn-composer-end"><button class="dn-send" type="button" aria-label="发送" disabled><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button></div>
    </div>
  </div>
  <div class="dn-suggestions" role="group" aria-label="建议">
    <button class="dn-suggestion" type="button"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/></svg><span>总结一份文件</span></button>
    <button class="dn-suggestion" type="button"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg><span>起草一封邮件</span></button>
    <button class="dn-suggestion" type="button"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg><span>解释这段代码</span></button>
  </div>
</div>
```

回答后的追问建议：

```html
<div class="dn-message-assistant">
  <p>年付转化率从 3.1% 升到 4.4%，主要来自首月优惠的调整。</p>
  <ul class="dn-followups" aria-label="追问建议">
    <li><button class="dn-followup" type="button"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>和上个季度对比一下</button></li>
    <li><button class="dn-followup" type="button"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>做成一张表格</button></li>
  </ul>
</div>
```

## SwiftUI

首页：`VStack` 里放问候语（`.deernovaDisplay`）、Composer、`FlowLayout` 或 `ViewThatFits` 排的建议按钮（`.buttonStyle(.bordered)`、`.buttonBorderShape(.capsule)` 的触屏写法）。追问建议是 `Button` 加 `Label(title, systemImage: "arrow.right")`，`.buttonStyle(.plain)`、`.foregroundStyle(.inkSecondary)`。

## 不要

- 首页堆满功能介绍、大插画和会话列表；问候语写营销口号。
- 起始建议超过 4 条，或者每次都一模一样；点了就直接发送，不给用户改的机会。
- 追问建议写「告诉我更多」这类空话；在每一条历史回答后面都留着。
- 给建议按钮用彩色底或渐变。
