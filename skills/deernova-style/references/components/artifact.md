# 产物与预览

AI 做出来的「东西」：文档、代码文件、网页、图表、图片。它们不直接铺在对话里，而是在回答里放一张**产物卡片**，点开后在右侧的**预览面板**里查看、切换版本、下载；网页类产物在面板里有**网页预览**；生成的图片直接排在回答里。

**需要提供**：产物的标题、类型、当前版本和更新时间，预览内容（渲染后的文档、网页地址、代码），可用的操作（打开、复制、下载、在新窗口打开）；图片还要提供宽高比和生成进度。

## 尺寸

<!-- tokens:artifact -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `artifact-card-height` | 56 | 64 | 60 | 回答里产物卡片的高度。 |
| `artifact-icon-size` | 36 | 40 | 40 | 产物卡片左侧类型图标块的边长。 |
<!-- /tokens -->

## 产物卡片

- 在回答正文里占一行：高 `artifact-card-height`，`surface-raised` 底、`line` 描边、`card-radius`，宽度跟正文一致，不超过 `content-max`。
- 从左到右：类型图标块（边长 `artifact-icon-size`，`surface-sunken` 底、`radius-sm`，里面是 `icon-size-md` 的图标）、标题（`callout`、`weight-medium`、`ink`）和下方一行说明（「文档 · 版本 3 · 刚刚更新」，`caption`、`ink-tertiary`）、右侧的「打开」次按钮和下载图标按钮。
- 整张卡片都是点击区域，点击在预览面板里打开；当前正在面板里显示的那张，卡片底色换成 `fill-selected`。
- **生成中**：说明换成微光文字「正在写 · 第 42 行」（见[加载状态](skeleton.md)），「打开」照常可用，面板里能看到内容在长。
- **被修改**：AI 后来又改了这个产物时，新回答里出现同一张卡片，说明写「已更新 · 版本 4」；旧回答里的卡片仍然指向它当时的版本。

## 预览面板

- 用 Web 应用右侧的[侧面板](toolbar.md)：第一次生成产物时，宽屏上自动打开；窄于 `breakpoint-md` 时不自动打开，只在点卡片后以[抽屉](sheet.md)打开。
- 顶部一行（高 `toolbar-height`，底部 1px `line`）：标题、版本切换「‹ 版本 3 ›」（等宽数字）、「预览 / 代码」[分段控件](segmented.md)，右侧是复制、下载、在新窗口打开、关闭。
- 内容区：文档按阅读排版（`type-prose`，栏宽 `content-max`），代码用[代码块](code-block.md)的样式加行号；切换版本时保持滚动位置。
- 用户可以直接在面板里编辑文字；编辑过的版本标「已编辑」，AI 下次修改时以它为基础。

## 网页预览

- 预览面板的内容区上方多一条地址栏：后退、前进、刷新三个图标按钮，中间是地址（`surface-sunken` 底、`radius-sm`、等宽 `caption`，可以选中复制），右侧是「在浏览器中打开」和设备宽度切换（桌面、平板、手机）。
- 页面在一个 `iframe` 里，四周不加额外的框；切换设备宽度时，页面在面板里居中并限制宽度，两边露出 `canvas`。
- 底部可以展开控制台：高度可以拖动，`type-code`，错误行用 `danger` 色的图标和文字；有错误时，控制台按钮上显示错误数。
- 加载中在地址栏下方显示不确定进度条；加载失败在页面位置显示原因和「重试」。

## 图片输出

- 生成中：按最终的宽高比占好位置，`surface-sunken` 底、`radius-md`，上面是骨架的微光和「正在生成 · 62%」（`caption`），完成后图片原地淡入，位置不跳。
- 一张图宽度和正文一致；多张图排成两列的网格，间距 `space-2`。图片有 `radius-md`，内侧一圈 1px `line`，让白底图片也有边界。
- 指针悬停在图片上时，右上角出现下载、放大、重新生成三个按钮（`surface-raised` 底的小圆按钮）；触屏上点图片进入全屏查看，按钮在全屏里。
- 放大查看用全屏的[弹窗](sheet.md)：黑色半透明背景，图片居中，左右切换同一组的其他图片，Esc 关闭。

## Web

```css
.dn-artifact {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: var(--content-max);
  min-height: var(--artifact-card-height);
  padding: 0 var(--space-2) 0 calc((var(--artifact-card-height) - var(--artifact-icon-size)) / 2 - var(--stroke-line));
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--card-radius);
  background: var(--surface-raised);
  color: var(--ink);
  text-align: start;
  cursor: pointer;
  transition: background-color var(--duration-instant) var(--ease-standard);
}
@media (hover: hover) { .dn-artifact:hover { background-image: linear-gradient(var(--fill-hover), var(--fill-hover)); } }
.dn-artifact[aria-current="true"] { background-image: linear-gradient(var(--fill-selected), var(--fill-selected)); }
.dn-artifact-icon { display: grid; place-items: center; flex: none; width: var(--artifact-icon-size); height: var(--artifact-icon-size); border-radius: var(--radius-sm); background: var(--surface-sunken); color: var(--ink-secondary); }
.dn-artifact-icon .dn-icon { width: var(--icon-size-md); height: var(--icon-size-md); }
.dn-artifact-text { display: grid; gap: 2px; flex: 1; min-width: 0; }
.dn-artifact-title { overflow: hidden; font: var(--weight-medium) var(--type-callout-size)/var(--type-callout-line) var(--font-sans); text-overflow: ellipsis; white-space: nowrap; }
.dn-artifact-meta { overflow: hidden; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); text-overflow: ellipsis; white-space: nowrap; }
.dn-artifact-actions { display: flex; flex: none; align-items: center; gap: 2px; }
.dn-preview { display: flex; flex-direction: column; min-width: 0; min-height: 0; border-left: var(--stroke-line) solid var(--line); background: var(--canvas); }
.dn-preview-head { display: flex; align-items: center; gap: var(--space-2); height: var(--toolbar-height); padding: 0 var(--space-2) 0 var(--space-4); border-bottom: var(--stroke-line) solid var(--line); }
.dn-preview-title { min-width: 0; overflow: hidden; font: var(--weight-medium) var(--type-callout-size)/1 var(--font-sans); text-overflow: ellipsis; white-space: nowrap; }
.dn-preview-version { display: inline-flex; align-items: center; gap: 2px; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); font-variant-numeric: tabular-nums; }
.dn-preview-head-end { display: flex; align-items: center; gap: 2px; margin-left: auto; }
.dn-addressbar { display: flex; align-items: center; gap: 2px; height: var(--toolbar-height); padding: 0 var(--space-2); border-bottom: var(--stroke-line) solid var(--line); }
.dn-address { flex: 1; min-width: 0; height: var(--button-height-sm); margin: 0 var(--space-1); padding: 0 var(--space-2); overflow: hidden; border-radius: var(--radius-sm); background: var(--surface-sunken); color: var(--ink-secondary); font: var(--weight-regular) var(--type-caption-size)/var(--button-height-sm) var(--font-mono); text-overflow: ellipsis; white-space: nowrap; user-select: all; }
.dn-preview-frame { flex: 1; min-height: 0; width: 100%; border: 0; background: var(--surface-raised); }
.dn-image-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); max-width: var(--content-max); }
.dn-image { position: relative; aspect-ratio: var(--ratio, 1); overflow: hidden; border-radius: var(--radius-md); background: var(--surface-sunken); outline: var(--stroke-line) solid var(--line); outline-offset: calc(var(--stroke-line) * -1); }
.dn-image img { display: block; width: 100%; height: 100%; object-fit: cover; }
.dn-image-status { position: absolute; left: var(--space-3); bottom: var(--space-3); color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); font-variant-numeric: tabular-nums; }
.dn-image-actions { position: absolute; top: var(--space-2); right: var(--space-2); display: flex; gap: var(--space-1); }
.dn-image-actions .dn-icon-button { border-radius: var(--radius-full); background: var(--surface-raised); box-shadow: var(--shadow-control); }
@media (hover: hover) and (pointer: fine) {
  .dn-image-actions { opacity: 0; transition: opacity var(--duration-instant) var(--ease-standard); }
  .dn-image:is(:hover, :focus-within) .dn-image-actions { opacity: 1; }
}
```

产物卡片（正在面板里显示的一张、生成中的一张），以及网页预览面板的顶部：

```html
<div class="dn-stack">
  <div class="dn-artifact" role="button" tabindex="0" aria-current="true">
    <span class="dn-artifact-icon"><svg class="dn-icon" aria-hidden="true"><use href="#dn-document"/></svg></span>
    <span class="dn-artifact-text"><span class="dn-artifact-title">第三季度经营分析</span><span class="dn-artifact-meta">文档 · 版本 3 · 刚刚更新</span></span>
    <span class="dn-artifact-actions"><button class="dn-button is-sm" type="button">打开</button><button class="dn-icon-button" type="button" aria-label="下载"><svg class="dn-icon" aria-hidden="true"><use href="#dn-download"/></svg></button></span>
  </div>
  <div class="dn-artifact" role="button" tabindex="0">
    <span class="dn-artifact-icon"><svg class="dn-icon" aria-hidden="true"><use href="#dn-code"/></svg></span>
    <span class="dn-artifact-text"><span class="dn-artifact-title">landing.html</span><span class="dn-artifact-meta"><span class="dn-shimmer-text">正在写 · 第 42 行</span></span></span>
    <span class="dn-artifact-actions"><button class="dn-button is-sm" type="button">打开</button></span>
  </div>
  <div class="dn-preview">
    <div class="dn-preview-head">
      <span class="dn-preview-title">landing.html</span>
      <span class="dn-preview-version"><button class="dn-icon-button" type="button" aria-label="上一个版本"><svg class="dn-icon" aria-hidden="true"><use href="#dn-chevron-left"/></svg></button>版本 2<button class="dn-icon-button" type="button" aria-label="下一个版本"><svg class="dn-icon" aria-hidden="true"><use href="#dn-chevron-right"/></svg></button></span>
      <div class="dn-preview-head-end">
        <button class="dn-icon-button" type="button" aria-label="复制"><svg class="dn-icon" aria-hidden="true"><use href="#dn-copy"/></svg></button>
        <button class="dn-icon-button" type="button" aria-label="关闭"><svg class="dn-icon" aria-hidden="true"><use href="#dn-close"/></svg></button>
      </div>
    </div>
    <div class="dn-addressbar">
      <button class="dn-icon-button" type="button" aria-label="刷新"><svg class="dn-icon" aria-hidden="true"><use href="#dn-regenerate"/></svg></button>
      <span class="dn-address">http://localhost:5173/landing.html</span>
      <button class="dn-icon-button" type="button" aria-label="在浏览器中打开"><svg class="dn-icon" aria-hidden="true"><use href="#dn-external"/></svg></button>
    </div>
  </div>
</div>
```

图片输出：一张已完成、一张生成中：

```html
<div class="dn-image-grid">
  <div class="dn-image"><div class="dn-image-actions"><button class="dn-icon-button" type="button" aria-label="下载"><svg class="dn-icon" aria-hidden="true"><use href="#dn-download"/></svg></button><button class="dn-icon-button" type="button" aria-label="放大查看"><svg class="dn-icon" aria-hidden="true"><use href="#dn-expand"/></svg></button></div></div>
  <div class="dn-image dn-skeleton-block" aria-busy="true"><span class="dn-image-status">正在生成 · 62%</span></div>
</div>
```

## SwiftUI

产物卡片是一个 `Button`，内容是 `HStack`（图标块、两行文字、操作），`.buttonStyle(.plain)` 加 `surfaceRaised` 底和 1pt `line` 描边；点击在 `.inspector` 里打开预览（Mac、iPad），iPhone 上推入新页面。网页预览用 `WKWebView` 包一层；图片用 `AsyncImage`，生成中用占位的 `RoundedRectangle` 加 `.redacted(reason: .placeholder)`，保持 `.aspectRatio`。

## 不要

- 把整篇文档、整个网页的代码直接铺在对话里。
- 产物被修改后，旧回答里的卡片也跟着变成新版本；切换版本时丢掉滚动位置。
- 窄屏上自动弹出预览面板挡住对话。
- 图片生成完成时布局跳动；给图片加彩色边框或阴影。
