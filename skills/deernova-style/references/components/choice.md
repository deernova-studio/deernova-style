# 选择控件

复选框、单选、开关和滑块：让用户从有限的选项里选，或者在一个范围里取值。

**需要提供**：每个选项的标签（名词或短语，不写「是否」），当前值，禁用的选项和原因；滑块还要提供范围、步长和单位。

## 先选对控件

| 情况 | 用 |
| --- | --- |
| 一个设置立即生效（打开通知、深色模式） | 开关，见 [分组列表](list.md) |
| 一个选项需要和表单一起提交（同意条款、记住我） | 复选框 |
| 几个选项可以同时选 | 一组复选框 |
| 2–5 个选项只能选一个，而且都要看得见 | 单选组；只有 2–4 个、很短的选项时，用[分段控件](segmented.md) |
| 6 个以上只能选一个 | [下拉选择](menu.md) |
| 在一个连续范围里取值（音量、温度、创造性） | 滑块，旁边显示当前值；需要精确数字时配一个输入框 |

## 尺寸

<!-- tokens:choice -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `check-size` | 16 | 22 | 18 | 复选框和单选的边长。 |
| `slider-thumb-size` | 16 | 24 | 20 | 滑块圆钮的直径。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `slider-track-height` | `4px` | 滑块轨道的高度。 |
<!-- /tokens -->

- **复选框**：边长 `check-size`，圆角 `radius-xs`，未选中是 `stroke-control` 宽的 `line-control` 描边（保证 3:1）、`surface-raised` 底；选中是 `accent` 底、`on-accent` 对勾；部分选中（父项下有的子项选了）是 `accent` 底、一条横线。
- **单选**：直径 `check-size` 的圆，未选中和复选框一样；选中是 `accent` 底，中间一个 `surface-raised` 的圆点。
- **开关**：尺寸和写法见 [分组列表](list.md)；打开是 `success`，关闭是 `fill-selected`。
- **滑块**：轨道高 `slider-track-height`、`radius-full`，已选部分 `accent`，未选部分 `fill-selected`；圆钮直径 `slider-thumb-size`，`surface-raised` 底加 `shadow-control`。当前值放在滑块右侧，`callout`、等宽数字，带单位。

## 排列和对齐

- 控件在左，标签在右，间距 `space-2`；控件和标签的第一行按中线对齐，标签折行时控件仍对齐第一行（见[布局与对齐](../foundations/layout.md)的「对齐第一行」）。
- 整行都是点击区域：点标签等于点控件。行高至少 `hit-min`。
- 一组选项竖排，项与项之间 `space-2`；组上方有一个组标签（`callout`、`weight-medium`、`ink-secondary`），下方可以有一句说明。只有 2–3 个很短的选项时可以横排，间距 `space-6`。
- 选项需要解释时，标签下方加一行 `caption`、`ink-tertiary` 的说明，左边缘和标签对齐。
- 开关放在行的最右边，标签在左（设置页的写法）；复选框和单选放在标签左边。

## 状态

- 悬停：未选中的框描边变 `ink-secondary`；已选中的不透明度降到 `opacity-solid-hover`。
- 键盘：Tab 进入一组单选时停在当前选中项，方向键在组内移动并选中；复选框用空格切换。用键盘聚焦时，复选框、单选的方框外面和滑块外面画焦点环，见[交互状态](../foundations/states.md)。
- 禁用：整行 `opacity-disabled`，旁边或说明里写清为什么不能选。
- 出错（必选没选）：组下方的说明换成 `danger` 色的错误信息，不把每个框都描红。

## Web

用原生 `<input type="checkbox">`、`<input type="radio">`、`<input type="range">`，外观用 `appearance: none` 重画，保留键盘和读屏行为。一组单选放在 `<fieldset>` 里，组标签用 `<legend>`；部分选中用脚本设置 `indeterminate`。

```css
.dn-choice { display: flex; align-items: flex-start; gap: var(--space-2); min-height: var(--hit-min); color: var(--ink); font: var(--type-body); cursor: pointer; }
.dn-choice-box { position: relative; display: grid; place-items: center; flex: none; width: var(--check-size); height: var(--check-size); margin-top: calc((var(--type-body-line) - var(--check-size)) / 2); }
.dn-choice-box > input {
  appearance: none;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  margin: 0;
  border: var(--stroke-control) solid var(--line-control);
  border-radius: var(--radius-xs);
  background: var(--surface-raised);
  cursor: pointer;
  transition: background-color var(--duration-instant) var(--ease-standard), border-color var(--duration-instant) var(--ease-standard);
}
.dn-choice-box > input[type="radio"] { border-radius: var(--radius-full); }
.dn-choice-box > input:is(:checked, :indeterminate) { border-color: var(--accent); background: var(--accent); }
.dn-choice-box > input[type="radio"]:checked { box-shadow: inset 0 0 0 calc(var(--check-size) / 4) var(--surface-raised); }
.dn-choice-box > .dn-icon { position: absolute; width: calc(var(--check-size) - 4px); height: calc(var(--check-size) - 4px); color: var(--on-accent); stroke-width: 2.4; opacity: 0; pointer-events: none; }
.dn-choice-box > input:checked + .dn-icon.is-check, .dn-choice-box > input:indeterminate + .dn-icon.is-check + .dn-icon.is-mixed { opacity: 1; }
.dn-choice-box > input:indeterminate + .dn-icon.is-check { opacity: 0; }
@media (hover: hover) {
  .dn-choice:hover .dn-choice-box > input:not(:checked, :indeterminate) { border-color: var(--ink-secondary); }
  .dn-choice:hover .dn-choice-box > input:is(:checked, :indeterminate) { opacity: var(--opacity-solid-hover); }
}
.dn-choice-box > input:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset); }
.dn-choice:has(input:disabled) { opacity: var(--opacity-disabled); cursor: default; }
.dn-choice-text { display: grid; gap: 2px; min-width: 0; }
.dn-choice-help { color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); }
.dn-choice-group { display: grid; gap: var(--space-2); margin: 0; padding: 0; border: 0; min-width: 0; }
.dn-choice-group > legend { margin-bottom: var(--space-1); padding: 0; color: var(--ink-secondary); font: var(--weight-medium) var(--type-callout-size)/var(--type-callout-line) var(--font-sans); }
.dn-slider-row { display: flex; align-items: center; gap: var(--space-3); min-height: var(--hit-min); }
.dn-slider-value { flex: none; min-width: 4ch; color: var(--ink); font: var(--type-callout); font-variant-numeric: tabular-nums; text-align: end; }
.dn-slider {
  --value: 50%;
  flex: 1;
  min-width: 0;
  height: var(--slider-thumb-size);
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}
.dn-slider::-webkit-slider-runnable-track { height: var(--slider-track-height); border-radius: var(--radius-full); background: linear-gradient(to right, var(--accent) var(--value), var(--fill-selected) var(--value)); }
.dn-slider::-moz-range-track { height: var(--slider-track-height); border-radius: var(--radius-full); background: var(--fill-selected); }
.dn-slider::-moz-range-progress { height: var(--slider-track-height); border-radius: var(--radius-full); background: var(--accent); }
.dn-slider::-webkit-slider-thumb { appearance: none; width: var(--slider-thumb-size); height: var(--slider-thumb-size); margin-top: calc((var(--slider-track-height) - var(--slider-thumb-size)) / 2); border: 0; border-radius: var(--radius-full); background: var(--surface-raised); box-shadow: var(--shadow-control), 0 0 0 var(--stroke-line) var(--line); }
.dn-slider::-moz-range-thumb { width: var(--slider-thumb-size); height: var(--slider-thumb-size); border: 0; border-radius: var(--radius-full); background: var(--surface-raised); box-shadow: var(--shadow-control), 0 0 0 var(--stroke-line) var(--line); }
.dn-slider:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset); border-radius: var(--radius-full); }
```

```html
<div class="dn-row is-top">
  <fieldset class="dn-choice-group">
    <legend>通知我</legend>
    <label class="dn-choice"><span class="dn-choice-box"><input type="checkbox" checked><svg class="dn-icon is-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><svg class="dn-icon is-mixed" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></span><span class="dn-choice-text"><span class="dn-choice-label">任务完成时</span><span class="dn-choice-help">后台运行的任务结束后发一条通知。</span></span></label>
    <label class="dn-choice"><span class="dn-choice-box"><input type="checkbox"><svg class="dn-icon is-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><svg class="dn-icon is-mixed" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></span><span class="dn-choice-text"><span class="dn-choice-label">需要我确认时</span></span></label>
    <label class="dn-choice"><span class="dn-choice-box"><input type="checkbox" disabled><svg class="dn-icon is-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><svg class="dn-icon is-mixed" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></span><span class="dn-choice-text"><span class="dn-choice-label">每日摘要</span><span class="dn-choice-help">升级到 Pro 后可用。</span></span></label>
  </fieldset>
  <fieldset class="dn-choice-group">
    <legend>回答长度</legend>
    <label class="dn-choice"><span class="dn-choice-box"><input type="radio" name="length"></span><span class="dn-choice-text"><span class="dn-choice-label">简短</span></span></label>
    <label class="dn-choice"><span class="dn-choice-box"><input type="radio" name="length" checked></span><span class="dn-choice-text"><span class="dn-choice-label">适中</span></span></label>
    <label class="dn-choice"><span class="dn-choice-box"><input type="radio" name="length"></span><span class="dn-choice-text"><span class="dn-choice-label">详细</span></span></label>
  </fieldset>
  <div class="dn-field">
    <label class="dn-field-label" for="temp">创造性</label>
    <div class="dn-slider-row"><input class="dn-slider" id="temp" type="range" min="0" max="100" value="50" aria-describedby="temp-value"><output class="dn-slider-value" id="temp-value" for="temp">0.5</output></div>
  </div>
</div>
```

真实页面里，滑块拖动时用脚本把 `--value` 设成当前百分比（`input.style.setProperty('--value', percent + '%')`），已选部分才会跟着变；Firefox 用 `::-moz-range-progress`，不需要脚本。

## SwiftUI

直接用系统控件：`Toggle`（Mac 上复选框样式 `.toggleStyle(.checkbox)`，iOS 上是开关）、`Picker` 加 `.pickerStyle(.radioGroup)`（Mac）或 `.inline`（iOS 的表单里显示对勾）、`Slider(value:in:step:)` 旁边放 `Text(value, format:)`。用 `.tint(.brandAccent)` 统一选中颜色；不要自己画这些控件。

## 不要

- 用开关表示需要「保存」才生效的选项；用复选框表示立即生效的设置。
- 单选组没有默认值，又允许用户不选（需要「不选」时加一个「无」选项）。
- 只有控件能点，标签不能点；控件和标签不对齐。
- 滑块不显示当前值；用滑块输入需要精确的数字。
- 用彩色区分选中状态（开关的 `success` 除外）。
