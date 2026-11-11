# 布局与对齐

页面怎么分栏、内容多宽、元素怎么对齐、哪里滚动。间距刻度见 [间距](spacing.md)，数值见 [设计变量](../tokens.md) 的「布局」。

## 页面结构

| 页面 | 结构 | 内容宽度 |
| --- | --- | --- |
| 对话、编辑器 | 侧边栏、顶栏、居中的内容栏、底部 Composer，右边可以开侧面板 | 内容栏不超过 `content-max` |
| 列表加详情（笔记、邮件、任务） | 侧边栏、列表栏（`pane-width`）、详情 | 详情里的正文不超过 `content-max` |
| 设置页、表单页 | 单栏居中，分组列表或表单 | 不超过 `form-max` |
| 表格、看板、数据页 | 顶部一行筛选和操作，下面是表格或卡片网格 | 不超过 `wide-max`，表格比它宽时在表格内部横向滚动 |
| 文档、长文 | 左侧目录（`sidebar-width`），正文栏居中 | 正文不超过 `content-max` |
| 官网 | 12 栏网格，栏间距 `grid-gutter` | 不超过 `wide-max` |

- 对话栏：消息左右各留 44，Composer 左右各留 32，宽度不超过 `content-max`。
- 一屏只有一个主内容区。侧边栏、列表栏、侧面板是辅助栏，宽度固定或可以拖动，主内容区占剩下的空间。
- 侧边栏可以在 `sidebar-width-min` 和 `sidebar-width-max` 之间拖动，双击分隔线恢复默认宽度 `sidebar-width`。
- 内容比可用宽度窄时，在主内容区里水平居中，两边留白；不要把文字拉满宽屏。左右至少留 `page-margin`。
- 各平台的具体骨架见场景说明：[Web 应用](../scenes/web.md)、[官网与文档](../scenes/web-marketing.md)、[macOS](../scenes/macos.md)、[iPadOS](../scenes/ipados.md)。

## 网格

- 官网和文档用 12 栏网格，栏间距 `grid-gutter`，左右边距 `page-margin`；窄于 `breakpoint-md` 时变成 6 栏，窄于 `breakpoint-sm` 时变成单栏。
- 应用界面不用栏网格，用 flex 和 grid 加间距 token 排版。卡片网格按可用宽度自动增减列数，见 [卡片](../components/card.md)。

## 水平对齐

- 文字左对齐，标题也是。只有空状态、加载状态、官网首屏标题居中；系统 Alert 的排法交给系统。
- 同一栏里的标题、正文、表单和列表共用一条左边线，也就是容器的内边距。分组标题和它下面的行左边缘对齐。
- 行尾的元素（计数、快捷键、开关、箭头、按钮）用 `margin-left: auto` 推到最右边，不要用空格或固定宽度去凑。
- 表格里的数字、金额、时间右对齐，并用等宽数字（`tabular-nums`）；文字列左对齐，表头和本列的内容对齐方式一致。
- 弹窗和表单底部的按钮靠右，主按钮在最右边；页面级的操作放在顶栏右侧，或者内容区顶部的右侧。

## 垂直对齐

按内容选一种，不要混用：

1. **单行控件和行：在固定高度里垂直居中。** 按钮、输入框、列表行、菜单项、标签、顶栏都用 `height`（或 `min-height`）加 `display: flex; align-items: center`，文字行高为 1。不要用上下内边距撑，也不要用 `padding-top`、`top: 1px` 微调。
2. **图标和文字：按中线对齐。** 同一行的图标和文字用 `align-items: center`，不按基线，也不用 `vertical-align: middle`。图标尺寸跟着字号：12–13 号字配 `icon-size-sm`，14–15 号配 `icon-size-md`，更大的配 `icon-size-lg`。
3. **不同字号的文字并排：按基线对齐。** 标题旁边的计数、单位、时间（例如 18 号标题旁边 13 号的「128 条」）用 `align-items: baseline`；按中线对齐时小字看起来会往上飘。
4. **两行条目（标题加一行说明）：整行居中。** 设置项、列表行、横幅里，前导图标和尾部的开关、箭头、按钮都在整行里垂直居中。
5. **长内容（三行以上，或者高度不固定）：对齐第一行。** 消息、任务说明、多行横幅里，前导的图标、头像、复选框和第一行文字的中线对齐，不跟着整块内容居中。写法是 `align-items: flex-start`，图标的上外边距等于（行高 − 图标高）÷ 2。尾部只有一个短按钮时可以在整块里居中（横幅）；内容很长时，尾部操作也对齐第一行，或者放到内容下方。
6. **标签和控件左右并排：中线对齐。** 设置项、筛选条里的标签和控件中线对齐；控件是多行文本框时，标签对齐它的第一行。
7. **表格：** 单行的单元格垂直居中；有单元格会折行时，整行改成顶部对齐。
8. **卡片网格：** 同一行的卡片顶部对齐，高度由内容决定。
9. **空状态、加载、整页提示：视觉居中。** 在可用区域里水平居中，垂直方向放在略高于正中的位置：上方留白和下方留白大约是 2 : 3。正好放在几何中心看起来会偏下，贴顶又像没加载完。
10. **光学修正：** 播放、发送这类不对称的图标，在圆形按钮里按视觉重心居中，可以偏移 1px；这是唯一允许手动微调的情况。

同一行的控件用同一个高度档位；必须混用时（输入框旁边一个小按钮），按中线对齐。大号标题和图标并排时，支持 `text-box: trim-both cap alphabetic` 的浏览器可以用它去掉字体上下的留白，让字的可见部分居中。

## 滚动与固定

- 应用里页面本身不滚动：侧边栏、列表栏、内容区、侧面板各自是一个纵向滚动区域，互不带动。文档和官网整页滚动，页眉吸顶。
- 顶栏、侧面板的标签头、表头固定，内容从下面滚过去。Composer 固定在内容区底部，内容区底部留出它的高度。
- 同一方向不要嵌套两个滚动区域。表格横向滚动只发生在表格内部，页面不能横向滚动。
- 弹出层和面板内部滚动时加 `overscroll-behavior: contain`，不带动后面的页面。
- 跳到页面锚点时，用 `scroll-padding-top` 留出吸顶元素的高度。

## 滚动条

- **Web 统一用一种细滚动条。** 所有滚动区域，包括页面本身，都用同一种：占 `scrollbar-size`（10px），中间是 `scrollbar-thumb-size`（6px）粗的胶囊滑块，`line-control` 色，悬停和拖动时变 `ink-tertiary`；轨道透明，没有两端的箭头按钮。滑块颜色来自 token，深色主题自动跟着换。
- **在全局样式里写一次。** 用下面的 CSS：Chrome、Edge、Safari 用 `::-webkit-scrollbar` 画，Firefox 用 `scrollbar-width: thin` 加 `scrollbar-color`。Chrome 里一个元素只要设置了 `scrollbar-width` 或 `scrollbar-color`，`::-webkit-scrollbar` 对它就失效，所以除了隐藏滚动条，组件里不要再写这两个属性，也不要给某个组件单独写一套滚动条或用脚本模拟。
- **SwiftUI 用系统滚动条。** 原生端的滚动指示条跟随用户的系统设置，不要改。
- **预留位置，不让内容跳动。** 整页滚动的页面（文档、官网）在 `html` 上设 `scrollbar-gutter: stable`；内容居中的主滚动区域（对话栏）也一样。这样内容从不满一屏变成超出一屏、或者弹窗打开锁住页面滚动时，滚动条出现和消失不会让内容左右跳。应用里页面本身不滚动，不要在 `html` 上预留。
- **内容别被压住。** 滚动区域的内边距写在滚动容器里面，右侧至少留 `space-2`，滚动时才浮现的滚动条不会盖住文字。
- **能隐藏的只有横向滑动条。** 标签、筛选项、卡片排成一行横向滑动时，可以隐藏滚动条（`scrollbar-width: none`），但必须有提示：末端渐隐、露出半张卡片，或者左右翻页按钮；滚到底时去掉渐隐。纵向的滚动区域一律不隐藏滚动条。
- **键盘也能滚。** 滚动区域里没有可以聚焦的内容时，给容器加 `tabindex="0"`、`role="region"` 和 `aria-label`，键盘用户才能用方向键滚动它，读屏也能读出它是什么。
- **把宽度算进去。** 细滚动条在 Chrome、Edge、Safari 里一直显示，占 `scrollbar-size`，在 Mac 上也不再是滚动时才浮现；Firefox 跟随系统设置。栏宽、居中和右侧留白按占位的情况检查：内容不被挤窄，没有多出来的横向滚动条。
- **滚动不加戏。** 不接管滚轮和触控板，不改滚动速度和惯性；`scroll-behavior: smooth` 只用于页内锚点跳转，开启「减弱动态效果」时去掉；吸附滚动（`scroll-snap`）只用于横向卡片条。
- **提示还有内容，用线不用阴影。** 顶栏、表头本来就有 1px 底线；弹窗、面板这类平时没有分隔线的区域，内容能滚动时才加上（见[弹窗](../components/sheet.md)）。不在内容边缘加阴影或渐变遮罩，横向滑动条的末端渐隐除外。

## 响应式

- `breakpoint-sm`（760）以下侧边栏收起成抽屉，多栏变单栏；`breakpoint-md`（960）以下侧面板变成抽屉，目录这类次要栏收起；`breakpoint-lg`（1280）以上内容不再变宽，两侧留白。断点只能写在媒体查询里，没有对应的 CSS 变量。
- 页面骨架跟着窗口宽度变（媒体查询）；组件跟着自己容器的宽度变（`@container`），同一张卡片放在主内容区和侧面板里都能排好。
- 任何宽度、200% 缩放下都不能横向滚动。
- 手机网页里固定在边缘的元素（底部操作条、轻提示）要让出安全区：`env(safe-area-inset-bottom)`，页面的 viewport 加 `viewport-fit=cover`。

## Web

```css
.dn-column { box-sizing: border-box; width: min(100%, var(--content-max) + 2 * var(--page-margin)); margin-inline: auto; padding-inline: var(--page-margin); }
.dn-column.is-form { width: min(100%, var(--form-max) + 2 * var(--page-margin)); }
.dn-column.is-wide { width: min(100%, var(--wide-max) + 2 * var(--page-margin)); }
.dn-scroll { min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
.dn-scroll.is-stable { scrollbar-gutter: stable; }
.dn-scroll-x { display: flex; gap: var(--gap-inline); overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; scroll-snap-type: x proximity; }
.dn-scroll-x::-webkit-scrollbar { display: none; }
.dn-scroll-x > * { flex: none; scroll-snap-align: start; }
.dn-scroll-x:not(.is-end) { mask-image: linear-gradient(to left, transparent, var(--ink) var(--space-8)); }
.dn-baseline { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--space-2); }
.dn-baseline-title { margin: 0; font: var(--type-title); }
.dn-baseline-meta { color: var(--ink-tertiary); font: var(--type-footnote); font-variant-numeric: tabular-nums; }
.dn-item { display: flex; align-items: center; gap: var(--space-3); min-width: 0; }
.dn-item > .dn-icon { color: var(--ink-secondary); }
.dn-item-text { flex: 1; min-width: 0; }
.dn-item-title { margin: 0; color: var(--ink); font: var(--weight-medium) var(--type-body-size)/var(--type-body-line) var(--font-sans); }
.dn-item-detail { margin: 0; color: var(--ink-secondary); font: var(--type-callout); }
.dn-item-end { flex: none; margin-left: auto; }
.dn-item.is-top { align-items: flex-start; }
.dn-item.is-top > .dn-icon { margin-top: calc((var(--type-body-line) - var(--icon-size-md)) / 2); }
.dn-item.is-top > .dn-item-end { margin-top: calc((var(--type-body-line) - var(--button-height-sm)) / 2); }
.dn-centered { display: grid; grid-template-rows: 2fr auto 3fr; justify-items: center; min-height: 100%; text-align: center; }
.dn-centered > * { grid-row: 2; }
@supports selector(::-webkit-scrollbar) {
  ::-webkit-scrollbar { width: var(--scrollbar-size); height: var(--scrollbar-size); }
  ::-webkit-scrollbar-track, ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-thumb { border: calc((var(--scrollbar-size) - var(--scrollbar-thumb-size)) / 2) solid transparent; border-radius: var(--radius-full); background: var(--line-control) padding-box; }
  ::-webkit-scrollbar-thumb:hover, ::-webkit-scrollbar-thumb:active { background-color: var(--ink-tertiary); }
  ::-webkit-scrollbar-button { display: none; }
}
@supports not selector(::-webkit-scrollbar) {
  * { scrollbar-width: thin; scrollbar-color: var(--line-control) transparent; }
}
```

不同字号并排，按基线对齐：

```html
<div class="dn-baseline">
  <h3 class="dn-baseline-title">笔记</h3>
  <span class="dn-baseline-meta">128 条</span>
</div>
```

两行条目，图标和尾部按钮在整行里居中：

```html
<div class="dn-item">
  <svg class="dn-icon" aria-hidden="true"><use href="#dn-cloud"/></svg>
  <div class="dn-item-text">
    <p class="dn-item-title">iCloud 同步</p>
    <p class="dn-item-detail">在登录同一账户的设备之间保持一致。</p>
  </div>
  <button class="dn-button is-sm dn-item-end" type="button">管理</button>
</div>
```

长内容，图标和按钮对齐第一行：

```html
<div class="dn-item is-top">
  <svg class="dn-icon" aria-hidden="true"><use href="#dn-check"/></svg>
  <div class="dn-item-text">
    <p class="dn-item-title">会议纪要已整理</p>
    <p class="dn-item-detail">按议题分成了三段，待办事项单独列在最后，负责人和截止日期都已经补上。原始录音的转写保留在附件里，需要核对时可以打开对照。</p>
  </div>
  <button class="dn-button is-sm dn-item-end" type="button">打开</button>
</div>
```

空状态在可用区域里视觉居中（上下留白约 2 : 3）：

```html
<div class="dn-centered">
  <div class="dn-empty">
    <svg class="dn-icon" aria-hidden="true"><use href="#dn-file"/></svg>
    <p class="dn-empty-title">还没有笔记</p>
    <p class="dn-empty-body">点右上角的加号新建一条。</p>
  </div>
</div>
```

滚动区域用细滚动条；横向滑动条隐藏滚动条、末端渐隐：

```html
<div class="dn-scroll" tabindex="0" role="region" aria-label="最近的会话">
  <p class="dn-item-title">整理周会记录</p>
  <p class="dn-item-title">修复登录页的焦点顺序</p>
  <p class="dn-item-title">起草发布说明</p>
  <p class="dn-item-title">对比三种排版方案</p>
  <p class="dn-item-title">检查深色主题的对比度</p>
  <p class="dn-item-title">补全弹窗的键盘操作</p>
  <p class="dn-item-title">写 tooltip 的测试</p>
  <p class="dn-item-title">更新安装说明</p>
  <p class="dn-item-title">导出图标</p>
</div>
<div class="dn-scroll-x" tabindex="0" role="region" aria-label="筛选">
  <span class="dn-tag">全部</span><span class="dn-tag">今天</span><span class="dn-tag">本周</span><span class="dn-tag">已完成</span><span class="dn-tag">进行中</span><span class="dn-tag">有附件</span><span class="dn-tag">我创建的</span><span class="dn-tag">共享给我</span><span class="dn-tag">已归档</span><span class="dn-tag">草稿</span>
</div>
```

## SwiftUI

`Form`、`List`、`NavigationSplitView` 自带对齐和滚动，不要改；滚动指示条保持系统默认，跟随用户的系统设置。只有横向卡片条可以用 `.scrollIndicators(.hidden)`，并露出半张卡片提示还能滑动。自己排的内容按下面写：

```swift
// 图标和文字：用 Label，图标会对齐到第一行文字
Label("同步", systemImage: "arrow.triangle.2.circlepath")

// 不同字号并排：按基线
HStack(alignment: .firstTextBaseline, spacing: Deernova.space2) {
    Text("笔记").font(.deernovaTitle)
    Text("128 条").font(.footnote).monospacedDigit().foregroundStyle(.inkTertiary)
}

// 两行条目：整行居中
HStack(spacing: Deernova.space3) {
    Label {
        VStack(alignment: .leading, spacing: 2) {
            Text("iCloud 同步")
            Text("在登录同一账户的设备之间保持一致。").font(.footnote).foregroundStyle(.inkSecondary)
        }
    } icon: {
        Image(systemName: "icloud")
    }
    Spacer()
    Toggle("iCloud 同步", isOn: $sync).labelsHidden()
}

// 内容栏限宽并居中
ScrollView {
    content
        .frame(maxWidth: Deernova.contentMax, alignment: .leading)
        .padding(.horizontal, Deernova.pageMargin)
        .frame(maxWidth: .infinity)
}

// 横向卡片条：隐藏滚动条，按卡片吸附，露出下一张的一部分
ScrollView(.horizontal) {
    LazyHStack(spacing: Deernova.cardGap) {
        ForEach(notes) { NoteCard(note: $0).frame(width: 240) }
    }
    .scrollTargetLayout()
}
.scrollIndicators(.hidden)
.scrollTargetBehavior(.viewAligned)
.contentMargins(.horizontal, Deernova.pageMargin)

// 空状态：系统组件已经处理了视觉居中
ContentUnavailableView("还没有笔记", systemImage: "doc", description: Text("点右上角的加号新建一条。"))
```

## 不要

- 用 `padding-top`、`margin-top`、`position: relative; top: 1px` 去凑垂直居中（第一行对齐的公式和图标的 1px 光学修正除外）。
- 用和高度相等的 `line-height` 让单行文字居中：文字一折行就会溢出。用 flex 居中。
- 用 `vertical-align: middle` 对齐图标和文字。
- 不同字号并排时按中线对齐；多行内容里让图标、头像跟着整块内容居中。
- 把空状态贴在顶部，或者正好放在几何中心。
- 把正文拉满宽屏；正文和普通标题居中排版。
- 页面和里面的栏同时滚动；同一方向嵌套滚动；页面出现横向滚动。
- 给单个组件另写一套滚动条，或者用脚本模拟滚动条；隐藏纵向滚动区域的滚动条；接管滚轮或改滚动速度；在应用的 `html` 上预留滚动条位置。
- 按设备型号写死布局；用可用宽度和尺寸类别判断。
